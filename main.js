//initialization of requirements
import axios from 'axios';
import fs from 'fs';
import config from './config.js';
import tagHandlers from './template/tagHandlers.js';
const template = fs.readFileSync('./template/content.txt');
const episodeNum = Number(process.argv[2]);

//utility functions
const getEpNum = name => Number(name.split(':')[0].replace(/\D/g, ''));

//script
function script() {
  if (!episodeNum || !template || !tagHandlers) {
    throw new Error(`Error: bad arguements (${episodeNum})`);
  }
  if (!config.auth || !config.apiURL || !config.castURL) {
    throw new Error(`Error: bad config (${config})`);
  }

  axios
    .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + config.auth
      }
    })
    .then(res => {
      const token = res.data.access_token;

      axios
        .get(config.apiURL + '/episodes?market=US&limit=1', {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then(res => {
          const lastEpNum = getEpNum(res.data.items[0].name);
          const offset = lastEpNum - episodeNum - 1;
          const extraEpisodes = res.data.total - lastEpNum;

          axios
            .get(`${config.apiURL}/episodes?market=US&limit=${extraEpisodes}&offset=${offset > 0 ? offset : 0}`, {
              headers: {
                Authorization: 'Bearer ' + token
              }
            })
            .then(res => {
              const apiData = res.data.items.filter(episode =>
                [episodeNum + 1, episodeNum, episodeNum - 1].includes(getEpNum(episode.name))
              );

              const name = apiData[apiData.length - 2]?.name
                .toLowerCase()
                .replace(/[’':,.]/g, '')
                .replace(' - ', '-')
                .replace(/\s+/g, '-');

              axios
                .get(config.castURL + name)
                .then(res => {
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

                  console.log(result);
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

//execute
script();
