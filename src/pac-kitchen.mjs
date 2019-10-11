import { cook } from './pac-engine.mjs';
import fs from 'fs';

const standardStr = fs.readFileSync('./pac-kitchen.standard.json.js').toString();
const standard = eval(standardStr);
if (standard.pacKitchenVersion !== 0) {
  throw new TypeError('Unsupported format!');
}

const customStr = fs.readFileSync('./pac-kitchen.custom.json.js').toString();
const custom = eval(customStr);
if (custom.pacKitchenVersion !== 0) {
  throw new TypeError('Unsupported format!');
}

standard.rules
  .forEach((rule, index) => {

    if (rule.order === undefined) {
      rule.order = -500 + index;
    }
  });

custom.rules
  .forEach((rule, index) => {

    if (rule.order === undefined) {
      rule.order = -200 + index;
    }
  });

const rules = [...standard.rules, ...custom.rules].filter(
  (rule) => custom.enabledRules.includes(rule.id),
).sort((a, b) => a.order - b.order);

const middlewares = rules
  .map((rule) => rule.middlewares)
  .filter((mw) => mw)
  .reduce((acc, value) => { acc.push(...value); return acc; }, []);


const eventToPartedQueue = rules
  .map((rule) => rule.eventToQueues)
  .filter((e2qs) => e2qs)
  .map((e2qs) => Object.entries(e2qs))
  .reduce((acc, eventQueuesPairs) => {

    eventQueuesPairs.forEach(([eventName, queues]) => {

      acc[eventName] = acc[eventName] || { begining: [], ending: [], middle: [] };
      queues.forEach((queue) =>
        acc[eventName][queue.queueAt || 'middle'].push(...queue.actions),
      );
    });
    return acc;
  }, {});

const eventToActions = Object.entries(eventToPartedQueue).reduce((acc, [eventName, partedQueue]) => {

  acc[eventName] = [...partedQueue.begining, ...partedQueue.middle, ...partedQueue.ending.reverse()];
  return acc;
}, {});

const mergeObjects = (...objects) => {

  const defined = objects.filter((o) => o !== undefined);
  const ifAllObjects = defined.every((o) => o.constructor.name === 'Object');
  if (ifAllObjects) {
    const keysSet = defined.map((o) => Object.keys(o)).reduce((set, keys) => {

      keys.forEach((key) => set.add(key));
      return set;
    }, new Set());
    return Array.from(keysSet).reduce((acc, key) => {

      acc[key] = mergeObjects(defined.map((o) => o[key]));
      return acc;
    }, {});
  }
  const ifAllEqual = defined.every((o) => o === defined[0]);
  if (ifAllEqual) {
    return defined[0];
  }
  throw new TypeError(`Can't merge: ${defined}`);
};
const options = mergeObjects(...rules.map((rule) => rule.options));

const pacText = custom.pacScript.text;

console.log(cook({ pacText, options, eventToActions, middlewares }));
