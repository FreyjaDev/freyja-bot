import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/command";

const commandBuilder = new SlashCommandBuilder()
	.setName("game")
	.setDescription("Game Commands")
	.addSubcommandGroup((subcommandGroup) =>
		subcommandGroup
			.setName("result")
			.setDescription("Game Result Commands")
			.addSubcommand((subcommand) =>
				subcommand
					.setName("add")
					.setDescription("Add a Game Result")
					.addStringOption((option) =>
						option
							.setName("rating-type")
							.setDescription("Rating Type")
							.setRequired(true),
					)
					.addUserOption((option) =>
						option.setName("winner").setDescription("Winner").setRequired(true),
					)
					.addUserOption((option) =>
						option.setName("loser").setDescription("Loser").setRequired(true),
					)
			),
	);

const executor = async (interaction: CommandInteraction): Promise<void> => {
  const commandGroup = interaction.options.data[0].name;

  if (commandGroup === "result") {
    await interaction.reply("Not implemented");
    // await handleResultCommand(interaction);
  } else {
    await interaction.reply("Command not found");
  }
}

export const gameCommands: Command = {
  commandBuilder,
  executor,
};
