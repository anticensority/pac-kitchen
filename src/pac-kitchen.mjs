import { cook as engineCook } from './pac-engine.mjs';

export const cook = (standard, custom) => {

  standard.rules
    .forEach((rule, index) => {

      if (rule.order === undefined) {
        rule.order = -500 + index;
      }
    });

  custom.rules = custom.rules || [];
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
      console.log('KEYS:', keysSet);
      return Array.from(keysSet).reduce((acc, key) => {

        acc[key] = mergeObjects(...defined.map((o) => o[key]));
        return acc;
      }, {});
    }
    const ifAllEqual = defined.every((o) => o === defined[0]);
    if (ifAllEqual) {
      console.log('EQUAL');
      return defined[0];
    }
    throw new TypeError(`Can't merge: ${defined}`);
  };
  const opts = rules.map((rule) => rule.options);
  console.log('OPTS', opts);
  const options = mergeObjects(...opts);
  console.log('MERGED', options);

  const pacText = custom.pacScript.text;

  return engineCook({ pacText, options, eventToActions, middlewares });

};
