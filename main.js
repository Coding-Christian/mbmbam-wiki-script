//initialization of requirements
import axios from 'axios';
import fs from 'fs';
import config from './config.js';
import tagHandlers from './template/tagHandlers.js';
const template = fs.readFileSync('./template/content.txt');
const apiURL = 'https://api.spotify.com/v1/shows/308BQUUnIkoH2UAXJCAt0g';
const pcURL = 'https://maximumfun.org/episodes/my-brother-my-brother-and-me/';
const extraEpisodes = 12; //extra clips on Spotify that aren't main episodes
let apiData = [];
let webData = '';
let token = '';

//utility functions
const getEpNum = name => Number(name.split(':')[0].replace(/\D/g, ''));

//script
function script() {
  const episodeNum = Number(process.argv[2]);

  if (!config.auth || !episodeNum || !template || !tagHandlers) {
    throw new Error(`Error: bad arguements (${episodeNum})`);
  }

  axios
    .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + config.auth
      }
    })
    .then(res => {
      token = res.data.access_token;

      axios
        .get(apiURL + '/episodes?market=US&limit=1', {
          headers: {
            Authorization: 'Bearer ' + token
          }
        })
        .then(res => {
          const offset = getEpNum(res.data.items[0].name) - episodeNum - 1;

          axios
            .get(`${apiURL}/episodes?market=US&limit=${extraEpisodes}&offset=${offset > 0 ? offset : 0}`, {
              headers: {
                Authorization: 'Bearer ' + token
              }
            })
            .then(res => {
              apiData = res.data.items.filter(episode =>
                [episodeNum + 1, episodeNum, episodeNum - 1].includes(getEpNum(episode.name))
              );

              const name = apiData[apiData.length - 2]?.name
                .toLowerCase()
                .replace(/[’':,.-]/g, '')
                .replace(/\s+/g, '-');

              axios
                .get(pcURL + name)
                .then(res => {
                  webData = res.data;
                  if (apiData.length && webData) {
                    const data = {
                      webData,
                      previous: apiData.pop(),
                      episode: apiData.pop(),
                      next: apiData.pop()
                    };

                    let result = template.toString();

                    Object.keys(tagHandlers).forEach(tag => {
                      result = result.replace(tag, tagHandlers[tag](data));
                    });

                    console.log(result);
                  }
                })
                .catch(err => {
                  throw new Error(`${pcURL + name} not found: ${err}`);
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
