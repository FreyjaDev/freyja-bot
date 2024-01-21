import {
	CommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

// TODO: Add support for subcommand groups to the executor
export interface Command {
	commandBuilder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
	executor: (interaction: CommandInteraction) => Promise<void>;
}
