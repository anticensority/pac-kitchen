import fs from 'fs';

const checkVersion = (json) => {

  if (json.pacKitchenVersion !== 0) {
    throw new TypeError('Unsupported format!');
  }
};

const produceJson = (filePath) => {

  const str = fs.readFileSync(`${filePath}.json.js`).toString();
  const config = eval(str);
  checkVersion(config);

  fs.writeFileSync(`${filePath}.json`, JSON.stringify(
    config,
    (key, value) => {

      switch(typeof value) {
        case 'function':
          return `function!${value}`;
        case 'string':
          return `string!${value}`;
        default:
          return value;
      }
    },
    2,
  ));
};

[
  './pac-kitchen.standard',
  './pac-kitchen.custom',
].forEach(produceJson);
