import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/command";
import axios, { HttpStatusCode } from "axios";


const commandBuilder = new SlashCommandBuilder()
  .setName('server')
  .setDescription('Guild Commands')
  .addSubcommand(subcommand =>
    subcommand.setName('init').setDescription('Initialize the server')
  )

const handleInitCommand = async (interaction: CommandInteraction) => {
  const guildId = interaction.guildId
  const url = process.env.FREYJA_API_URL

  if (guildId === null || url === undefined) {
    await interaction.reply('Oops! Cannot fetch your server id!')
    return;
  }

  await interaction.deferReply();

  const response = await axios.post<string>(`${url}/guild/${guildId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (response.data === 'Guild initialized') {
    await interaction.editReply('Congratulation! Your server is initialized!');
  } else if(response.status === HttpStatusCode.Conflict) {
    await interaction.editReply('Wait! It looks like your server has already been initialized.')
  } else {
    await interaction.editReply('Oops! Server initialization is failed...')
  }
}

const executor = async (interaction: CommandInteraction): Promise<void> => {
  const subcommand = interaction.options.data[0].name

  if (subcommand === 'init') {
    await handleInitCommand(interaction);
  } else {
    await interaction.reply("Command not found");
  }
}

export const guildCommands: Command = {
  commandBuilder,
  executor
}
