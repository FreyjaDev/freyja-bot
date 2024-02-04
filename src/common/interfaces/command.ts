import {
	ChatInputCommandInteraction,
	CommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

export type CommandExecutor = ((interaction: ChatInputCommandInteraction) => Promise<void>) | ((interaction: CommandInteraction) => Promise<void>);

export interface Command {
	commandBuilder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
	executor: CommandExecutor;
}
