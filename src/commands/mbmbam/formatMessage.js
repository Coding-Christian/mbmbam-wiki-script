import fs from 'fs';
import templateHandlers from './templateHandlers.js';
//relative file path from root of project
const template = fs.readFileSync('./src/commands/mbmbam/template.txt');
//eslint-disable-next-line no-undef
const logResult = process.argv[2] === 'log';

if (!template || !templateHandlers) {
  throw new Error('Error: missing dependency');
}

export default (data) => {
  let result = template.toString();
  Object.keys(templateHandlers).forEach(tag => {
    result = result.replace(tag, templateHandlers[tag](data));
  });
  if (logResult) {
    console.log(result);
  }
  return result;
};
