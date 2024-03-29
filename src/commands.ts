import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { addGameResult, fetchGuildLeaderboard, fetchUserRating } from './http';

const ratingCommand = new SlashCommandBuilder()
  .setName('rating')
  .setDescription(
    'ユーザーのレーティング。ユーザーが指定されていない場合は実行者。',
  )
  .addUserOption((option) =>
    option.setName('user').setDescription('ユーザー').setRequired(false),
  );

const ratingCommandHandler = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user') ?? interaction.user;

  const guildId = interaction.guildId;

  if (guildId === null) {
    await interaction.reply('このコマンドはサーバー内でのみ有効です。');
    return;
  }

  await interaction.deferReply();

  const userRating = await fetchUserRating(guildId, user.id);

  if (userRating === undefined) {
    await interaction.editReply(
      'ユーザーのレーティングが見つかりませんでした。レーティングはゲーム結果の登録に伴って登録されます。',
    );
    return;
  }

  const embed = new EmbedBuilder().setTitle(user.displayName).addFields([
    {
      name: '順位',
      value: userRating.rank?.toString() ?? '不明',
    },
    {
      name: 'レーティング',
      value: userRating.rating.toString(),
    },
  ]);

  await interaction.editReply({
    embeds: [embed.toJSON()],
  });
};

const leaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('サーバーのランキング');

const leaderboardCommandHandler = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guildId = interaction.guildId;

  if (guildId === null) {
    await interaction.reply('このコマンドはサーバー内でのみ有効です。');
    return;
  }

  await interaction.deferReply();

  const leaderboard = await fetchGuildLeaderboard(guildId);
  const fields = await Promise.all(
    leaderboard.slice(0, 10).map(async (userRating, index) => {
      const user = await interaction.guild?.members.fetch(userRating.userId);

      return {
        name: `#${index + 1} ${user?.displayName ?? userRating.userId}`,
        value: `レーティング: ${userRating.rating}`,
      };
    }),
  );

  const embed = new EmbedBuilder()
    .setTitle('ランキング')
    .setDescription(`${interaction.guild?.name}の上位10名`)
    .addFields(fields);

  await interaction.editReply({
    embeds: [embed.toJSON()],
  });
};

const gameCommand = new SlashCommandBuilder()
  .setName('game')
  .setDescription('ゲームコマンド')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('ゲーム結果の登録')
      .addUserOption((option) =>
        option.setName('winner').setDescription('勝者').setRequired(true),
      )
      .addUserOption((option) =>
        option.setName('loser').setDescription('敗者').setRequired(true),
      ),
  );

const gameCommandHandler = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'add') {
    const winner = interaction.options.getUser('winner', true);
    const loser = interaction.options.getUser('loser', true);

    if (winner.id === loser.id) {
      await interaction.reply('同一ユーザー同士のゲーム結果は登録できません。');
      return;
    }

    if (winner.bot || loser.bot) {
      await interaction.reply('Botをレーティング対象にすることはできません。');
      return;
    }

    const guildId = interaction.guildId;

    if (guildId === null) {
      await interaction.reply('このコマンドはサーバー内でのみ有効です。');
      return;
    }

    await interaction.deferReply();

    const result = await addGameResult(guildId, winner.id, loser.id);

    const embed = new EmbedBuilder().setTitle('結果').addFields([
      {
        name: winner.displayName,
        value: `レーティング: => ${result.winUser.rating}`,
      },
      {
        name: loser.displayName,
        value: `レーティング: => ${result.loseUser.rating}`,
      },
    ]);

    await interaction.editReply({
      content: '登録に成功しました。',
      embeds: [embed.toJSON()],
    });
  }
};

export const commandExecutor = async (
  interaction: ChatInputCommandInteraction,
) => {
  if (interaction.commandName === ratingCommand.name) {
    await ratingCommandHandler(interaction);
  } else if (interaction.commandName === leaderboardCommand.name) {
    await leaderboardCommandHandler(interaction);
  } else if (interaction.commandName === gameCommand.name) {
    await gameCommandHandler(interaction);
  }
};

const commands = [ratingCommand, leaderboardCommand, gameCommand];

const jsonCommands = () => commands.map((command) => command.toJSON());

export { commands, jsonCommands };
