import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface Command {
  commandBuilder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  executor: (interaction: CommandInteraction) => Promise<void>;
}
