import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { addGameResult, fetchGuildLeaderboard, fetchUserRating } from './http';

const ratingCommand = new SlashCommandBuilder()
  .setName('rating')
  .setDescription('Get the rating of a user')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to get the rating of')
      .setRequired(false),
  );

const ratingCommandHandler = async (
  interaction: ChatInputCommandInteraction,
) => {
  const user = interaction.options.getUser('user') ?? interaction.user;

  const guildId = interaction.guildId;

  if (guildId === null) {
    await interaction.editReply('This command can only be used in a server');
    return;
  }

  await interaction.deferReply();

  const userRating = await fetchUserRating(guildId, user.id);

  await interaction.editReply(
    `${user.username}'s rating is ${userRating.rating}`,
  );
};

const leaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Get the leaderboard of the server');

const leaderboardCommandHandler = async (
  interaction: ChatInputCommandInteraction,
) => {
  const guildId = interaction.guildId;

  if (guildId === null) {
    await interaction.editReply('This command can only be used in a server');
    return;
  }

  await interaction.deferReply();

  const leaderboard = await fetchGuildLeaderboard(guildId);

  const embeds = leaderboard.slice(0, 10).map((userRating, index) => {
    return new EmbedBuilder()
      .setTitle(`#${index + 1} ${userRating.userId}`)
      .setDescription(`Rating: ${userRating.rating}`)
      .toJSON();
  });

  await interaction.editReply({
    embeds,
  });
};

const gameCommand = new SlashCommandBuilder()
  .setName('game')
  .setDescription('Get the results of the latest games')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('Add a game result')
      .addUserOption((option) =>
        option
          .setName('winner')
          .setDescription('The winner of the game')
          .setRequired(true),
      )
      .addUserOption((option) =>
        option
          .setName('loser')
          .setDescription('The loser of the game')
          .setRequired(true),
      ),
  );

const gameCommandHandler = async (interaction: ChatInputCommandInteraction) => {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'add') {
    const winner = interaction.options.getUser('winner')!;
    const loser = interaction.options.getUser('loser')!;

    const guildId = interaction.guildId;

    if (guildId === null) {
      await interaction.editReply('This command can only be used in a server');
      return;
    }

    await interaction.deferReply();

    await addGameResult(guildId, winner.id, loser.id);

    await interaction.editReply('Game result added');
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
