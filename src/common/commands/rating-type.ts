import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { APIEmbedField } from "discord.js/typings";

import { Command } from "../interfaces/command";
import axios from "axios";
import { RatingType } from "../interfaces/rating-type.interface";

const commandBuilder = new SlashCommandBuilder()
	.setName("rating")
	.setDescription("Rating Commands")
	.addSubcommandGroup((subcommandGroup) =>
		subcommandGroup
			.setName("type")
			.setDescription("Rating Type Commands")
			.addSubcommand((subcommand) =>
				subcommand
					.setName("add")
					.setDescription("Add a Rating Type")
					.addStringOption((option) =>
						option
							.setName("name")
							.setDescription("Name of the Rating Type")
							.setRequired(true),
					),
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName("delete")
					.setDescription("Delete a Rating Type")
					.addStringOption((option) =>
						option
							.setName("id")
							.setDescription("ID of the Rating Type")
							.setRequired(true),
					),
			)
			.addSubcommand((subcommand) =>
				subcommand.setName("list").setDescription("List Rating Types"),
			),
	);

const executor = async (interaction: CommandInteraction): Promise<void> => {
	const commandGroup = interaction.options.data[0].name;

	if (commandGroup === "type") {
		await handleTypeCommand(interaction);
	} else {
		await interaction.reply("Command not found");
	}
};

const handleTypeCommand = async (
	interaction: CommandInteraction,
): Promise<void> => {
	const command = interaction.options.data[0].options?.[0].name;

	if (command === "add") {
		await handleTypeAddCommand(interaction);
	} else if (command === "delete") {
		await handleTypeDeleteCommand(interaction);
	} else if (command === "list") {
		await handleTypeListCommand(interaction);
	} else {
		await interaction.reply("Command not found");
	}
};

const handleTypeAddCommand = async (
	interaction: CommandInteraction,
): Promise<void> => {
	const name = interaction.options.data[0].options?.[0].options?.[0].value;
	const guildId = interaction.guildId
	const url = process.env.FREYJA_API_URL

	if (guildId === null || url === undefined) {
		await interaction.reply('Oops! Cannot fetch your server id!')
		return;
	}

	await interaction.deferReply();

	const response = await axios.post(`${url}/guild/${guildId}/rating-types`, {
		name
	});

	if (response.status === 201) {
		await interaction.editReply(`Add Rating Type: ${name}`);
	} else {
		await interaction.editReply(`Failed to add Rating Type: ${name}`);
	}
};

const handleTypeDeleteCommand = async (
	interaction: CommandInteraction,
): Promise<void> => {
	const id = interaction.options.data[0].options?.[0].options?.[0].value;

	await interaction.reply(`Delete Rating Type: ${id}`);
};

const handleTypeListCommand = async (
	interaction: CommandInteraction,
): Promise<void> => {
	const guildId = interaction.guildId
	const url = process.env.FREYJA_API_URL

	if (guildId === null || url === undefined) {
		await interaction.reply('Oops! Cannot fetch your server id!')
		return;
	}

	await interaction.deferReply();

	const response = await axios.get<RatingType[]>(`${url}/guild/${guildId}/rating-types`, {
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (response.status === 200) {
		const ratingTypes = response.data;
		const embedFields = ratingTypes.map((ratingType): APIEmbedField => ({
			name: ratingType.name,
			value: `ID: ${ratingType.id}`,
		}))
		const embed = new EmbedBuilder().setTitle("Rating Types").addFields(...embedFields);

		await interaction.editReply({
			embeds: [embed]
		});
	} else {
		console.log(response.status);
		console.log(response.data)
		await interaction.editReply("Failed to get Rating Types");
	}
};

export const ratingTypeCommands: Command = {
	commandBuilder,
	executor,
};
