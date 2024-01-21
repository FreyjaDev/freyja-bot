import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { Command } from '../interfaces/command';

const commandBuilder = new SlashCommandBuilder()
  .setName('rating')
  .setDescription('Rating Commands')
  .addSubcommandGroup((subcommandGroup) =>
    subcommandGroup
      .setName('type')
      .setDescription('Rating Type Commands')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('Add a Rating Type')
          .addStringOption((option) =>
            option
              .setName('name')
              .setDescription('Name of the Rating Type')
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('delete')
          .setDescription('Delete a Rating Type')
          .addStringOption((option) =>
            option
              .setName('id')
              .setDescription('ID of the Rating Type')
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand.setName('list').setDescription('List Rating Types'),
      ),
  );

const executor = async (interaction: CommandInteraction): Promise<void> => {
  const commandGroup = interaction.options.data[0].name;

  if(commandGroup === 'type') {
    await handleTypeCommand(interaction);
  }
  else {
    await interaction.reply('Command not found');
  }
};

const handleTypeCommand = async (interaction: CommandInteraction): Promise<void> => {
  const command = interaction.options.data[0].options?.[0].name;

  if (command === 'add') {
    await handleTypeAddCommand(interaction);
  }
  else if (command === 'delete') {
    await handleTypeDeleteCommand(interaction);
  }
  else if (command === 'list') {
    await handleTypeListCommand(interaction);
  }
  else {
    await interaction.reply('Command not found');
  }
}

const handleTypeAddCommand = async (interaction: CommandInteraction): Promise<void> => {
  const name = interaction.options.data[0].options?.[0].options?.[0].value;

  await interaction.reply(`Add Rating Type: ${name}`);
}

const handleTypeDeleteCommand = async (interaction: CommandInteraction): Promise<void> => {
  const id = interaction.options.data[0].options?.[0].options?.[0].value;

  await interaction.reply(`Delete Rating Type: ${id}`);
}

const handleTypeListCommand = async (interaction: CommandInteraction): Promise<void> => {
  await interaction.reply('List Rating Types');
}

export const ratingTypeCommands: Command = {
  commandBuilder,
  executor,
};
