export default (episodeNum) => {
  let episodeNums = [`${episodeNum - 1}`, `${episodeNum}`, `${episodeNum + 1}`];
  if (episodeNum < 11) {
    switch (episodeNum) {
      case 10:
        episodeNums = ['09', '10', '11'];
        break;
      case 9:
        episodeNums = ['08', '09', '10'];
        break;
      case 1:
        episodeNums = ['01', '02'];
        break;
      default:
        episodeNums = [`0${episodeNum - 1}`, `0${episodeNum}`, `0${episodeNum + 1}`];
    }
  }
  return episodeNums;
};
