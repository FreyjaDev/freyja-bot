import { SlashCommandBuilder } from 'discord.js';

const ratingCommand = new SlashCommandBuilder()
  .setName('rating')
  .setDescription('Get the rating of a user')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to get the rating of')
      .setRequired(false),
  );

const leaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Get the leaderboard of the server');

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

const commands = [ratingCommand, leaderboardCommand, gameCommand];

const jsonCommands = () => commands.map((command) => command.toJSON());

export { commands, jsonCommands };
