import { GatewayIntentBits, REST, Routes } from "discord.js";
import "dotenv/config";
import yargs from "yargs";

import { Bot } from "./common/bot";
import { ratingTypeCommands } from "./common/commands/rating-type";
import { gameCommands } from "./common/commands/game";
import { guildCommands } from "./common/commands/guild";

const args = yargs
	.options({
		global: {
			default: false,
			demandOption: "initCommands",
			describe: "Change command deployment destination to global",
			type: "boolean",
		},
		initCommands: {
			default: false,
			describe: "Register commands to Discord API",
			type: "boolean",
		},
	})
	.parseSync();

const bot = new Bot({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

process.on("SIGINT", () => {
	console.log("Caught interrupt signal");

	if (bot.isReady()) {
		bot.destroy().then();
	}
});

const commands = [ratingTypeCommands, gameCommands, guildCommands];

const registerCommands = async (token: string) => {
	const clientId = process.env.CLIENT_ID;

	if (clientId === undefined) {
		console.error("CLIENT_ID is undefined");
		return;
	}

	const rest = new REST().setToken(token);

	const commandsJson = commands.map((command) =>
		command.commandBuilder.toJSON(),
	);

	let route: `/${string}`;
	if (!args.global) {
		const guildId = process.env.TEST_GUILD_ID;

		if (guildId === undefined) {
			console.error("TEST_GUILD_ID is undefined");
			return;
		}

		route = Routes.applicationGuildCommands(clientId, guildId);
	} else {
		route = Routes.applicationCommands(clientId);
	}

	try {
		const data = await rest.put(route, { body: commandsJson });

		if (Array.isArray(data)) {
			console.log(
				`Successfully reloaded ${data.length} application (/) commands.`,
			);
		} else {
			console.log(`Successfully but got ${data}`);
		}
	} catch (error) {
		console.error(error);
	}
};

const startBot = async (token: string) => {
	console.log("Starting bot...");

	bot.addCommands(commands);

	await bot.login(token);
};

const main = async () => {
	const token = process.env.DISCORD_BOT_TOKEN;

	if (token === undefined) {
		console.error("DISCORD_BOT_TOKEN is undefined");
		return;
	}

	if (args.initCommands) {
		await registerCommands(token);
	} else {
		await startBot(token);
	}
};

main().then();
