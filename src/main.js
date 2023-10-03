//initialization of requirements
import { Client, GatewayIntentBits } from 'discord.js';
import mbmbamWikiScript from './mbmbamWikiScript/mbmbamWikiScript.js';
import config from '../config.js';

//connect to Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log('');
  console.log('Ready...');
});

client.on('messageCreate', message => {
  if (message.author.bot) {
    return false;
  }

  const content = message.content.split(' ');
  const command = content[0];

  if (command === '!mbmbam') {
    const episode = content[1];

    if (!episode) {
      console.log(`Ignoring blank request from ${message.author.username}`);
      message.reply('Provide an episode number');
    } else if (Number(episode) >= 1) {
      console.log(`Request from ${message.author.username}: Episode ${episode}`);
      mbmbamWikiScript(message, Number(episode));
    } else {
      console.log(`Ignoring bad request from ${message.author.username}: Episode ${episode}`);
      message.reply('Episodes are numbered 1 and greater');
    }
  }
});

client.login(config.token);
