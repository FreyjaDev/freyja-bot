import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder
} from "discord.js";
import { APIEmbedField } from "discord.js/typings";

import { Command } from "../interfaces/command";
import axios from "axios";
import { RatingType } from "../interfaces/rating-type.interface";
import { messages } from "../../constants/messages";
import { enMessages } from "../../constants/messages/message-en";

type Subcommand = "add" | "delete" | "list";

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

const executor = async (interaction: ChatInputCommandInteraction): Promise<void> => {
	const commandGroup = interaction.options.getSubcommandGroup(true);

	if (commandGroup === "type") {
		await handleTypeCommand(interaction);
	} else {
		await interaction.reply("Command not found");
	}
};

const handleTypeCommand = async (
	interaction: ChatInputCommandInteraction,
): Promise<void> => {
	try {
		const command = interaction.options.getSubcommand(true) as Subcommand;

		switch (command) {
			case "add":
				await handleTypeAddCommand(interaction);
				break;
			case "delete":
				await handleTypeDeleteCommand(interaction);
				break;
			case "list":
				await handleTypeListCommand(interaction);
				break;
		}
	} catch (e) {
		console.error(e);
		await interaction.reply("Command not found");
	}
};

const handleTypeAddCommand = async (
	interaction: ChatInputCommandInteraction,
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
		await interaction.editReply(messages[interaction.locale].ratingTypeAdded ?? enMessages.ratingTypeAdded);
	} else {
		await interaction.editReply(`Failed to add Rating Type: ${name}`);
	}
};

const handleTypeDeleteCommand = async (
	interaction: ChatInputCommandInteraction,
): Promise<void> => {
	const id = interaction.options.getString("id", true);
	const guildId = interaction.guildId;
	const url = process.env.FREYJA_API_URL;

	if (guildId === null || url === undefined) {
		await interaction.reply('Oops! Cannot fetch your server id!')
		return;
	}

	await interaction.deferReply();

	try {
		await axios.delete(`${url}/guild/${guildId}/rating-types/${id}`);
		await interaction.editReply(messages[interaction.locale].ratingTypeDeleted ?? enMessages.ratingTypeDeleted);
	} catch (e) {
		await interaction.editReply('Failed to delete the rating type.');
	}
};

const handleTypeListCommand = async (
	interaction: ChatInputCommandInteraction,
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
