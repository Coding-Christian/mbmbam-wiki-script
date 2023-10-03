import axios from 'axios';
import getEpisodeNums from './getEpisodeNums.js';
import formatMessage from './formatMessage.js';
import { config } from '../config.js';

export default (message, episodeNum) => {
  if (!episodeNum) {
    throw new Error(`Error: bad arguement (${episodeNum})`);
  }
  if (!config.clientId || !config.clientSecret || !config.apiURL || !config.castURL) {
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
                  const formattedMessage = formatMessage({
                    webData: res.data,
                    previous: (episodeNum === 1) ? undefined : apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  });
                  message.reply('```' + formattedMessage + '```');
                })
                .catch(err => {
                  console.log(`- unable to retrieve maximumfun.org page (${err})`);
                  const formattedMessage = formatMessage({
                    webData: '',
                    previous: (episodeNum === 1) ? undefined : apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  });
                  message.reply('```' + formattedMessage + '```');
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
};
