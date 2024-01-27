// Utility functions for use in this file
const format = string => {
  if (!string) {
    return '';
  }
  return string
    .replace(/<\/*p>/g, '')
    .replace(/<br\/>/g, '')
    .replace(/&#39;/g, '\'')
    .replace('’', '\'')
    .replace('Suggested talking points: ', '')
    .trim();
};

// Data Processing Functions for Tags in Template
// - functions should take in 1 paramter "data"
// - "data" has the following format:
//     {
//       webData: "string",
//       previous: Episode{},
//       episode: Episode{},
//       next: Episode{}
//     }
// - webData is a string representing the HTML of the episode's maximumfun.org page:
//     https://maximumfun.org/episodes/my-brother-my-brother-and-me/
// - Episode is an object returned by the spotify podcast api:
//     https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-shows-episodes

const $len$ = data => {
  const ms = data.episode.duration_ms;
  const min = Math.floor(data.episode.duration_ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
};

const $date$ = data => {
  const date = data.episode.release_date.split('-');
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

const $prev$ = data => {
  return data.previous ? data.previous.name.replace('MBMBaM', 'Episode') : '';
};

const $desc$ = data => {
  return format(data.episode.html_description.match(/<p>(.+?)<\/p>/g)[0]);
};

const $tp$ = data => {
  const paragraphs = data.episode.html_description.match(/<p>(.+?)<\/p>/g);
  let result = format(paragraphs[1]);
  if (paragraphs[2]) {
    result += `${result ? '\n\n' : ''}${format(paragraphs[2])}`;
  }
  return result;
};

const $mp3$ = data => {
  const { webData } = data;
  if (webData.length) {
    const matches = [
      ...webData.match(/id="single-episode-buttons">[\s\S]+?<div/)[0].matchAll(/<a[^>]+href="([^"]+?)"/g)
    ];
    if (matches[0]) {
      return matches[0][1];
    }
  }
  return '';
};

const $ts$ = data => {
  const { webData } = data;
  if (webData.length) {
    const matches = [
      ...webData.match(/id="single-episode-buttons">[\s\S]+?<div/)[0].matchAll(/<a[^>]+href="([^"]+?)"/g)
    ];
    if (matches[1]) {
      return matches[1][1];
    }
  }
  return '';
};

const $next$ = data => {
  return data.next?.name.replace('MBMBaM', 'Episode') || '';
};

export default { $len$, $date$, $prev$, $desc$, $tp$, $mp3$, $ts$, $next$ };
