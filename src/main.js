//initialization of requirements
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { discordConfig } from './config.js';
import mbmbam from './commands/mbmbam/index.js';

if (!discordConfig.token) {
  throw new Error('Error: missing Discord token');
}

//connect to Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
client.commands.set(mbmbam.data.name, mbmbam);

client.once(Events.ClientReady, () => {
  console.log('');
  console.log('Ready...');
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (e) {
        console.log(e);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
    } else {
      await interaction.reply({ content: 'Command not found!', ephemeral: true });
    }
  }
});

client.login(discordConfig.token);
