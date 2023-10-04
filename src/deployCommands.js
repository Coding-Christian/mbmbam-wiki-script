import { REST, Routes } from 'discord.js';
import { discordConfig } from './config.js';
import mbmbam from './commands/mbmbam/index.js';

const commands = [
  mbmbam.data.toJSON(),
];

(async () => {
  try {
    console.log('');
    console.log('Ready...');
    console.log(`- refreshing ${commands.length} slash commands`);

    await new REST()
      .setToken(discordConfig.token)
      .put(Routes.applicationCommands(discordConfig.clientId), { body: commands });

    console.log(`- completed at ${(new Date(Date.now())).toString()}`);
  } catch (error) {
    console.error(error);
  }
})();
