const kitchenStartsMark = '\n\n//%#@@@@@@ PAC_KITCHEN_STARTS @@@@@@#%';

export const cook = ({ pacText, middlewares, options = {}, eventToActions = {} }) => {

  pacText = pacText.replace(
    new RegExp(kitchenStartsMark + '[\\s\\S]*$', 'g'),
    ''
  );
  /a/.test('a'); // GC RegExp.input and friends.

  const stringify = (object) => {

    if (Object(object) === object) {
      const keys = Object.keys(object);
      if (keys.includes('constructor') || object.constructor.name === 'Object') {
        return `{ ${keys.map((key) => key + ':' + stringify(object[key])).join(',\n')} }`;
      }
      if (object.constructor.name === 'Array') {
        return `[${object.map(stringify).join(', ')}]`;
      }
    }
    if (typeof object === 'string') {
      return `"${object.replace(/(\n|\r|")/g, '\\$1')}"`;
    }
    // Strings created with `new String(...)` has typeof === 'object' and are not wraped in quotes!
    return String(object);

  };

  return pacText + `${ kitchenStartsMark }
/******/
/******/;(function(global) {
/******/  "use strict";
/******/
/******/  const originalFindProxyForURL = FindProxyForURL;
/******/  const middlewares = ${stringify(middlewares)};
/******/
/******/  const context = {
/******/    inputs: {
/******/      options: ${JSON.stringify(options, null, 2)},
/******/      global,
/******/    },
/******/    outputs: {
/******/      proxiesString: '',
/******/    },
/******/    utils: {},
/******/  };
/******/
/******/  context.utils.parseProxiesString = (str = context.outputs.proxiesString) =>
/******/
/******/    str
/******/      .split(/(?:\\s*;+\\s*)+/g)
/******/      .map((p) => p.trim())
/******/      .filter((p) => p)
/******/      .map((pStr) => {
/******/
/******/        const [type, host] = pStr.split(/\\s+/g);
/******/        let port, hostname;
/******/        if (host) {
/******/          const parts = host.split(/:/g);
/******/          if (parts.length > 1) {
/******/            port = parts.pop();
/******/          }
/******/          hostname = parts.join(':')
/******/        }
/******/        return {
/******/          type,
/******/          host,
/******/          hostname,
/******/          port,
/******/        };
/******/      });
/******/
/******/  const eventToActions = ${stringify(eventToActions)};
/******/  context.utils.emitEvent = (eventName) => {
/******/
/******/    const actions = eventToActions[eventName];
/******/    if (!actions) {
/******/      return;
/******/    }
/******/    actions.forEach((action) => {
/******/
/******/      switch(action.type) {
/******/        case 'replaceProxiesString':
/******/          context.outputs.proxiesString =
/******/            context.outputs.proxiesString.replace(
/******/              new RegExp(action.from, 'g'),
/******/              action.to,
/******/            );
/******/          break;
/******/        case 'custom':
/******/          const result = action.handler(context);
/******/          if (typeof result === 'string') {
/******/            context.outputs.proxiesString = result;
/******/          }
/******/          break;
/******/        default:
/******/          throw new TypeError('Unkown action type: ' + action.type);
/******/      }
/******/    });
/******/  };
/******/
/******/  let i = 0;
/******/  const next = () => {
/******/    if (i < middlewares.length) {
/******/      const proxiesStringMaybe = middlewares[i++](context, next);
/******/      if (typeof proxiesStringMaybe === 'string') {
/******/        context.outputs.proxiesString = proxiesStringMaybe;
/******/      }
/******/    } else {
/******/      context.utils.emitEvent('BEFORE_PAC_SCRIPT');
/******/      context.outputs.proxiesString = originalFindProxyForURL(
/******/        context.inputs.url,
/******/        context.inputs.hostname,
/******/      );
/******/      context.utils.emitEvent('AFTER_PAC_SCRIPT');
/******/    }
/******/  }
/******/
/******/  const tmp = function(url, hostname) {
/******/
/******/    Object.assign(context.inputs, { url, hostname });
/******/    context.utils.emitEvent('START');
/******/    next();
/******/    context.utils.emitEvent('FINISH');
/******/    return context.outputs.proxiesString;
/******/  }
/******/  if (global) {
/******/    global.FindProxyForURL = tmp;
/******/  } else {
/******/    FindProxyForURL = tmp;
/******/  }
/******/
/******/})(this);`;

};
