import {
  Client,
  ClientOptions,
  Events,
  CommandInteraction,
  Interaction,
} from 'discord.js';

import { Command } from './interfaces/command';

export class Bot extends Client {
  private readonly commandExecutors: Record<
    string,
    (interaction: CommandInteraction) => Promise<void>
  > = {};

  constructor(options: ClientOptions) {
    super(options);

    this.once(Events.ClientReady, this.onReady.bind(this));
    this.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
  }

  public addCommands(commands: Command[]): void {
    commands.forEach((command) => this.addCommand(command));
  }

  public addCommand(command: Command): void {
    this.commandExecutors[command.commandBuilder.name] = command.executor;
  }

  // Events Listener
  private onReady(client: Client<true>): void {
    console.log(`Ready! Logged in as ${client.user.username}`);
  }

  private async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      await this.handleCommandInteraction(interaction);
    }
  }

  private async handleCommandInteraction(
    interaction: CommandInteraction,
  ): Promise<void> {
    const executor = this.commandExecutors[interaction.commandName];

    if (executor == undefined) {
      console.log(`Command ${interaction.commandName} not found`);
      return;
    }

    try {
      await executor(interaction);
    } catch (e) {
      console.error(e);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  }
}
