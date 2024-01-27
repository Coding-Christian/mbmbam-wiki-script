import { castURL } from '../../config.js';

if (!castURL) {
  throw new Error(`Error: bad MaxFun URL (${castURL})`);
}

export default (name, episodeNum) => {
  let formattedName = name
    .toLowerCase()
    .replace(/[’':,.]/g, '')
    .replace(' - ', '-')
    .replace(/\s+/g, '-');

  if (episodeNum < 478) {
    formattedName = formattedName.replace(/(?:-a-|-by-|-for-|-in-|-is-|-of-|-the-|-to-|-up-|-with-)/g, '-');
  }

  if (episodeNum < 220 && !(episodeNum < 218 && episodeNum > 213)) {
    formattedName = formattedName.replace('mbmbam-', 'my-brother-my-brother-and-me-');
  }

  // const nameNoThe = fullName.replace('-the-', '-');
  return castURL + formattedName;
};
