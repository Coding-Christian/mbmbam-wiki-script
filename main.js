//initialization of requirements
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import config from './config.js';
import templateHandlers from './template.js';
//helpers
const template = fs.readFileSync('./template.txt');
const reply = (message, data) => {
  let result = template.toString();
  Object.keys(templateHandlers).forEach(tag => {
    result = result.replace(tag, templateHandlers[tag](data));
  });
  console.log(`- completed at ${(new Date(Date.now())).toString()}`);
  console.log(result);
  message.reply('```' + result + '```');
};

const getEpisodeNums = (episodeNum) => {
  let episodeNums = [`${episodeNum - 1}`, `${episodeNum}`, `${episodeNum + 1}`];
  if (episodeNum < 11) {
    switch (episodeNum) {
      case 10:
        episodeNums = ['09', '10', '11'];
        break;
      case 9:
        episodeNums = ['08', '09', '10'];
        break;
      case 1:
        episodeNums = ['01', '02'];
        break;
      default:
        episodeNums = [`0${episodeNum - 1}`, `0${episodeNum}`, `0${episodeNum + 1}`];
    }
  }
  return episodeNums;
};
//script
function script(message, episodeNum) {
  if (!episodeNum) {
    throw new Error(`Error: bad arguement (${episodeNum})`);
  }
  if (!template || !templateHandlers) {
    throw new Error('Error: missing dependency');
  }
  if (!config.clientId || !config.clientSecret || !config.token || !config.apiURL || !config.castURL) {
    throw new Error(`Error: bad config (${JSON.stringify(Object.keys(config))})`);
  }

  console.log('- parameters verified');

  axios
    .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + btoa(unescape(encodeURIComponent(`${config.clientId}:${config.clientSecret}`)))
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
          const extraEpisodes = (res.data.total - lastEpNum) * 2;

          axios
            .get(`${config.apiURL}/episodes?market=US&limit=${extraEpisodes}&offset=${offset > 0 ? offset : 0}`, {
              headers: {
                Authorization: 'Bearer ' + token
              }
            })
            .then(res => {
              console.log('- retrieved requested episode data from Spotify');
              const apiData = res.data.items.filter(episode => {
                let currentEpNum = episode.name.split(':')[0].replace(/\D/g, '');
                currentEpNum = currentEpNum || episode.name.split(':')[1].replace(/\D/g, '');
                return getEpisodeNums(episodeNum).includes(currentEpNum);
              });

              const name = apiData[apiData.length - 2]?.name
                .toLowerCase()
                .replace(/[’':,.]/g, '')
                .replace(' - ', '-')
                .replace(/\s+/g, '-');

              axios
                .get(config.castURL + name)
                .then(res => {
                  console.log('- retrieved maximumfun.org page');
                  reply(message, {
                    webData: res.data,
                    previous: (episodeNum === 1) ? undefined : apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  });
                })
                .catch(err => {
                  console.log(`- unable to retrieve maximumfun.org page (${err})`);
                  reply(message, {
                    webData: '',
                    previous: (episodeNum === 1) ? undefined : apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  });
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
      script(message, Number(episode));
    } else {
      console.log(`Ignoring bad request from ${message.author.username}: Episode ${episode}`);
      message.reply('Episodes are numbered 1 and greater');
    }
  }
});

client.login(config.token);
