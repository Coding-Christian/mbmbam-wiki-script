//initialization of requirements
const { auth } = require('./config.json');
const axios = require('axios');
const fs = require('fs');
const apiURL = 'https://api.spotify.com/v1/shows/308BQUUnIkoH2UAXJCAt0g';
const pcURL = 'https://maximumfun.org/episodes/my-brother-my-brother-and-me/';
const extraEpisodes = 12; //extra clips on Spotify that aren't main episodes
let apiData = [];
let webData = '';
let token = '';

//utility functions
const getEpNum = name => Number(name.split(':')[0].replace(/\D/g, ''));

getParagraphs = data => {
  return data.html_description.match(/\<p\>(.+?)\<\/p\>/g).map(str =>
    str
      .replace(/\<\/*p\>/g, '')
      .replace(/&#39;/g, "'")
      .replace('’', "'")
  );
};

const getLinks = data => {
  const result = [
    ...data.match(/id="single-episode-buttons"\>[\s\S]+?\<div/)[0]?.matchAll(/\<a[^\>]+href="([^"]+?)"/g)
  ];
  return [result[0][1], result[1] ? result[1][1] : ''];
};

const formatLength = ms => `${Math.floor(ms / 60000)}:${Math.floor((ms % 60000) / 1000)}`;

const formatDate = string => {
  const date = string.split('-');
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  return `${months[date[1] - 1]} ${date[2]}, ${date[0]}`;
};

const formatName = string => {
  return string
    .toLowerCase()
    .replace(/[’':,.-]/g, '')
    .replace(/\s+/g, '-');
};

const processData = () => {
  const previous = apiData.pop();
  const episode = apiData.pop();
  const next = apiData.pop();
  const paragraphs = getParagraphs(episode);
  const links = getLinks(webData);

  const result = fs
    .readFileSync('template.txt')
    .toString()
    .replace('${len}', formatLength(episode.duration_ms))
    .replace('${date}', formatDate(episode.release_date))
    .replace('${prev}', previous.name.replace('MBMBaM', 'Episode'))
    .replace('${desc}', paragraphs[0])
    .replace('${tp}', paragraphs[1].replace('Suggested talking points: ', ''))
    .replace('${tp2}', paragraphs[2] ? '\n\n' + paragraphs[2] : '')
    .replace('${mp3}', links[0])
    .replace('${ts}', links[1])
    .replace('${next}', next?.name.replace('MBMBaM', 'Episode') || '');

  console.log(result);
};

//script
function script() {
  const episodeNum = Number(process.argv[2]);

  if (!auth || !episodeNum) {
    throw new Error(`Error: bad arguements (${episodeNum})`);
  }

  axios
    .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        Authorization: 'Basic ' + auth
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

              const showURL = pcUrl + formatName(apiData[apiData.length - 2]?.name);

              axios
                .get(showURL)
                .then(res => {
                  webData = res.data;
                  if (apiData.length && webData) {
                    processData();
                  }
                })
                .catch(err => {
                  throw new Error(`${showURL} not found: ${err}`);
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

script();
