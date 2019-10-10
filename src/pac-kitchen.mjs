import { cook } from './pac-engine.mjs';
import fs from 'fs';

const std = fs.readFileSync('./pac-kitchen.standard.json.js').toString();
console.log(eval(std));
