//initialization of requirements
const { auth } = require('./config.json');
const axios = require('axios');
const apiURL = 'https://api.spotify.com/v1/shows/308BQUUnIkoH2UAXJCAt0g';
const extraEpisodes = 12; //extra clips on Spotify that aren't main episodes
let apiData = null;
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

const formatLength = ms => Math.floor(ms / 60000) + ':' + Math.floor((ms % 60000) / 1000);

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
  let previous, episode, next;
  if (apiData.length === 3) {
    next = apiData[0];
    episode = apiData[1];
    previous = apiData[2];
  } else if (apiData.length === 2) {
    episode = apiData[0];
    previous = apiData[1];
  } else {
    throw new Error('ERROR: wrong number of episodes found on Spotify');
  }

  const paragraphs = getParagraphs(episode);
  const links = getLinks(webData);

  const result = `{{PodcastInfobox
| Image = Mbmbam 506 cover with portraits.jpg
| Length = ${formatLength(episode.duration_ms)}
| Date = ${formatDate(episode.release_date)}
| Previous = ${previous.name.replace('MBMBaM', 'Episode')}
| Description = ${paragraphs[0]}
| Talkingpoints = ${paragraphs[1].replace('Suggested talking points: ', '')}\n${
    paragraphs[2] ? '\n' + paragraphs[2] : ''
  }
| mp3link = ${links[0]}
| transcript = ${links[1]}
| Next = ${next?.name.replace('MBMBaM', 'Episode') || ''}
}}
== Outline ==
{{{EpisodeOutline|}}}

== Quotes ==
{{{EpisodeQuotes|}}}

== Trivia ==
{{{EpisodeTrivia|}}}

== Deep Cuts ==
{{{EpisodeCuts|}}}`;

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

              const name = formatName(apiData[apiData.length - 2].name);
              // console.log('attempting to find maximum fun page...');
              // console.log('https://maximumfun.org/episodes/my-brother-my-brother-and-me/' + name);

              axios
                .get('https://maximumfun.org/episodes/my-brother-my-brother-and-me/' + name)
                .then(res => {
                  webData = res.data;
                  if (apiData && webData) {
                    processData();
                  }
                })
                .catch(err => {
                  throw new Error(err);
                });
            });
        })
        .catch(err => {
          throw new Error(err);
        });
    })
    .catch(err => {
      throw new Error(err);
    });
}

script();
