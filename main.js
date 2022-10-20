const auth = process.argv[0];
const name = process.argv[1];

if (!auth || !name) {
  console.log('Error: bad arguements');
  return;
}

const axios = require('axios');
let apiData = null;
let webData = '';

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

const processData = () => {
  const episode = apiData[0];
  const previous = apiData[1];

  const paragraphs = episode.html_description.match(/\<p\>(.+?)\<\/p\>/g).map(str => str.replace(/\<\/*p\>/g, ''));
  const links = [
    ...webData.match(/id="single-episode-buttons"\>[\s\S]+?\<div/)[0]?.matchAll(/\<a[^\>]+href="([^"]+?)"/g)
  ];

  return `{{PodcastInfobox
    | Image = Mbmbam 506 cover with portraits.jpg
    | Length = ${Math.floor(episode.duration_ms / 60000)}:${Math.floor((episode.duration_ms % 60000) / 1000)}
    | Date = ${formatDate(episode.release_date)}
    | Previous = ${previous.name.replace('MBMBaM', 'Episode')}
    | Description = ${paragraphs[0]}
    | Talkingpoints = ${paragraphs[1].replace('Suggested talking points: ', '')}

    ${paragraphs[2]}
    | mp3link = ${links[0][1]}
    | transcript = ${links[1] ? links[1][1] : ''}
    | Next =
    }}
    == Outline ==
    {{{EpisodeOutline|}}}

    == Quotes ==
    {{{EpisodeQuotes|}}}

    == Trivia ==
    {{{EpisodeTrivia|}}}

    == Deep Cuts ==
    {{{EpisodeCuts|}}}`;
};

axios
  .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      Authorization: 'Basic ' + auth
    }
  })
  .then(res => {
    axios
      .get('https://api.spotify.com/v1/shows/308BQUUnIkoH2UAXJCAt0g/episodes?market=US&limit=2', {
        headers: {
          Authorization: 'Bearer ' + res.data.access_token
        }
      })
      .then(res => {
        apiData = res.data.items;
        if (apiData && webData) {
          processData();
        }
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));

axios
  .get('https://maximumfun.org/episodes/my-brother-my-brother-and-me/' + name)
  .then(res => {
    webData = res.data;
    if (apiData && webData) {
      processData();
    }
  })
  .catch(err => console.log(err));
