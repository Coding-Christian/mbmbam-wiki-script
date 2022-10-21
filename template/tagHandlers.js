// Utility functions for use in this file
const format = string => {
  return string
    .replace(/\<\/*p\>/g, '')
    .replace(/&#39;/g, "'")
    .replace('’', "'");
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
  return data.previous.name.replace('MBMBaM', 'Episode');
};

const $desc$ = data => {
  return format(data.episode.html_description.match(/\<p\>(.+?)\<\/p\>/g)[0]);
};

const $tp$ = data => {
  const paragraphs = data.episode.html_description.match(/\<p\>(.+?)\<\/p\>/g);
  return (
    format(paragraphs[1]).replace('Suggested talking points: ', '') +
    (paragraphs[2] ? '\n\n' + format(paragraphs[2]) : '')
  );
};

const $mp3$ = data => {
  const result = [
    ...data.webData.match(/id="single-episode-buttons"\>[\s\S]+?\<div/)[0]?.matchAll(/\<a[^\>]+href="([^"]+?)"/g)
  ];
  return result[0][1];
};

const $ts$ = data => {
  const result = [
    ...data.webData.match(/id="single-episode-buttons"\>[\s\S]+?\<div/)[0]?.matchAll(/\<a[^\>]+href="([^"]+?)"/g)
  ];
  return result[1] ? result[1][1] : '';
};

const $next$ = data => {
  return data.next?.name.replace('MBMBaM', 'Episode') || '';
};

export default { $len$, $date$, $prev$, $desc$, $tp$, $mp3$, $ts$, $next$ };
