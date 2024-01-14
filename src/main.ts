import { Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

import { Bot } from './common/bot';

const bot = new Bot({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

process.on('SIGINT', function () {
  console.log('Caught interrupt signal');

  if (bot.isReady()) {
    bot.destroy().then();
  }
});

bot.once(Events.ClientReady, (client) => {
  console.log('Ready! Logged in as ' + client.user.username);
});

const start = () => {
  console.log('Starting bot...');
  bot.login(process.env.DISCORD_BOT_TOKEN).then();
};
start();
