import fs from 'fs';
import { readJson } from './json-reader.mjs';
import { cook } from './pac-kitchen.mjs';

const standard = readJson('./pac-kitchen.standard.json');
const custom = readJson('./pac-kitchen.custom.json');

const result = cook(standard, custom);
fs.writeFileSync('./proxy.pac', result);
