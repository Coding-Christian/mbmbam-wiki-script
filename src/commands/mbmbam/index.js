import { SlashCommandBuilder } from 'discord.js';
import script from './script.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mbmbam')
    .setDescription('Creates a MBMBaM Wiki template for the given episode number')
    .addIntegerOption(option => {
      return option
        .setName('episode')
        .setDescription('Number of the episode to template')
        .setRequired(true);
    }),
  async execute(interaction) {
    script(interaction, interaction.options.getInteger('episode'));
  },
};
