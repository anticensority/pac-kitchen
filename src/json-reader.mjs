import fs from 'fs';

export const readJson = (filePath) => {

  const str = fs.readFileSync(filePath).toString();
  return JSON.parse(str, (key, value) => {

    if (typeof value !== 'string') {
      return value;
    }
    const i = value.indexOf('!');
    const type = value.substr(0, i);
    const rest = value.substr(i + 1);
    switch(type) {
      case 'string':
        return rest;
      case 'function':
        return new String(rest); // So we can distinct 'string'-string and 'object'-string.
      default:
        throw new TypeError('Unkown string type from json: ' + type);
    }
  });

};
