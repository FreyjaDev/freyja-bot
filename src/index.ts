import { Client, REST, Routes } from 'discord.js';
import { commandExecutor, jsonCommands } from './commands';
import yargs from 'yargs';

const args = yargs(process.argv.slice(2))
  .option('rc', {
    alias: 'refresh-commands',
    type: 'boolean',
    describe: 'Refresh the commands',
    default: false,
  })
  .option('p', {
    alias: 'prod',
    type: 'boolean',
    describe: 'Run in production mode',
    default: false,
  })
  .parseSync();

const refreshCommands = async (token: string, prod: boolean = false) => {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');

    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!clientId) {
      console.error('No client ID provided');
      return;
    }

    if (prod) {
      console.log('Refreshing global commands');
      await rest.put(Routes.applicationCommands(clientId), {
        body: jsonCommands(),
      });
    } else {
      const guildId = process.env.DISCORD_GUILD_ID;

      if (!guildId) {
        console.error('No guild ID provided');
        return;
      }

      console.log('Refreshing guild commands');
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: jsonCommands(),
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const launchBot = async (token: string) => {
  const client = new Client({ intents: ['Guilds', 'GuildMessages'] });

  client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      await commandExecutor(interaction);
    } catch (e) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
      });
    }
  });

  await client.login(token);
};

const main = async () => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error('No token provided');
    return;
  }

  if (args.rc) {
    await refreshCommands(token, args.p);
    return;
  }

  await launchBot(token);
};

main()
  .then(() => {
    console.log('Bot started');
  })
  .catch(() => {
    console.error('Bot failed to start');
  });
