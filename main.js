//initialization of requirements
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import config from './config.js';
import tagHandlers from './template/tagHandlers.js';

//script
function script(message, episodeNum) {
  const template = fs.readFileSync('./template/content.txt');

  if (!episodeNum) {
    throw new Error(`Error: bad arguement (${episodeNum})`);
  }
  if (!template || !tagHandlers) {
    throw new Error('Error: missing dependency');
  }
  if (!config.auth || !config.token || !config.apiURL || !config.castURL) {
    throw new Error(`Error: bad config (${JSON.stringify(config)})`);
  }

  console.log('- parameters verified');

  axios
    .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + config.auth
      }
    })
    .then(res => {
      console.log('- authenticated with Spotify');

      const token = res.data.access_token;

      axios
        .get(config.apiURL + '/episodes?market=US&limit=1', {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then(res => {
          console.log('- retrieved latest episode data from Spotify');

          const lastEpNum = Number(res.data.items[0].name.split(':')[0].replace(/\D/g, ''));
          const offset = lastEpNum - episodeNum - 1;
          const extraEpisodes = res.data.total - lastEpNum;

          axios
            .get(`${config.apiURL}/episodes?market=US&limit=${extraEpisodes}&offset=${offset > 0 ? offset : 0}`, {
              headers: {
                Authorization: 'Bearer ' + token
              }
            })
            .then(res => {
              console.log('- retrieved requested episode data from Spotify');
              const apiData = res.data.items.filter(episode =>
                [episodeNum + 1, episodeNum, episodeNum - 1].includes(
                  Number(episode.name.split(':')[0].replace(/\D/g, ''))
                )
              );

              const name = apiData[apiData.length - 2]?.name
                .toLowerCase()
                .replace(/[’':,.]/g, '')
                .replace(' - ', '-')
                .replace(/\s+/g, '-');

              axios
                .get(config.castURL + name)
                .then(res => {
                  console.log('- retrieved maximumfun.org page');
                  const data = {
                    webData: res.data,
                    previous: apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  };

                  let result = template.toString();

                  Object.keys(tagHandlers).forEach(tag => {
                    result = result.replace(tag, tagHandlers[tag](data));
                  });

                  console.log('Completed:');
                  console.log('');
                  console.log(result);
                  console.log('');
                  message.reply('```' + result + '```');
                  console.log('Done. Waiting...');
                })
                .catch(err => {
                  throw new Error(`${config.castURL + name} not found: ${err}`);
                });
            });
        })
        .catch(err => {
          throw new Error('Find show on Spotify failed: ' + err);
        });
    })
    .catch(err => {
      throw new Error('Failed to authenticate with Spotify' + err);
    });
}

//connect to Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', message => {
  console.log('Ready...');
});

client.on('messageCreate', message => {
  if (message.author.bot) {
    return false;
  }

  if (/^!\w+/.test(message.content)) {
    const content = message.content.split(' ');
    const command = content[0];
    const episode = content[1];

    if (/^\d+$/.test(episode)) {
      console.log(`Request from ${message.author.username}: Episode ${episode}`);
      script(message, Number(episode));
    }
  }
});

client.login(config.token);
