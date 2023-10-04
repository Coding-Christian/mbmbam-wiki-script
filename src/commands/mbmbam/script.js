import axios from 'axios';
import getEpisodeNums from './getEpisodeNums.js';
import formatMessage from './formatMessage.js';
import { spotifyConfig, castURL } from '../../config.js';

export default (interaction, episodeNum) => {
  if (!episodeNum) {
    throw new Error(`Error: bad episode number (${episodeNum})`);
  }
  if (!castURL) {
    throw new Error(`Error: bad MaxFun URL (${castURL})`);
  }
  if (!spotifyConfig.clientId || !spotifyConfig.clientSecret || !spotifyConfig.apiURL) {
    throw new Error(`Error: bad Spotify config (${JSON.stringify(Object.keys(spotifyConfig))})`);
  }

  console.log('- parameters verified');

  axios
    .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + btoa(unescape(encodeURIComponent(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`)))
      }
    })
    .then(res => {
      console.log('- authenticated with Spotify');

      const token = res.data.access_token;

      axios
        .get(spotifyConfig.apiURL + '/episodes?market=US&limit=1', {
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
            .get(`${spotifyConfig.apiURL}/episodes?market=US&limit=${extraEpisodes}&offset=${offset > 0 ? offset : 0}`, {
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
                .get(castURL + name)
                .then(async res => {
                  console.log('- retrieved maximumfun.org page');
                  const formattedMessage = formatMessage({
                    webData: res.data,
                    previous: (episodeNum === 1) ? undefined : apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  });
                  await interaction.reply({ content: '```' + formattedMessage + '```', ephemeral: true });
                })
                .catch(async err => {
                  console.log(`- unable to retrieve maximumfun.org page (${err})`);
                  const formattedMessage = formatMessage({
                    webData: '',
                    previous: (episodeNum === 1) ? undefined : apiData.pop(),
                    episode: apiData.pop(),
                    next: apiData.pop()
                  });
                  await interaction.reply({ content: '```' + formattedMessage + '```', ephemeral: true });
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
