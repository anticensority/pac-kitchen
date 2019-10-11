const kitchenStartsMark = '\n\n//%#@@@@@@ PAC_KITCHEN_STARTS @@@@@@#%';

export const cook = ({ pacText, middlewares, options = {}, eventsToActions = {} }) => {

  pacText = pacText.replace(
    new RegExp(kitchenStartsMark + '[\\s\\S]*$', 'g'),
    ''
  );
  /a/.test('a'); // GC RegExp.input and friends.

  return pacText + `${ kitchenStartsMark }
/******/
/******/;(function(global) {
/******/  "use strict";
/******/
/******/  const originalFindProxyForURL = FindProxyForURL;
/******/  const middlewares = [
${middlewares.map((fn) => fn.toString()).join(',\n')}
/******/  ];
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
/******/
/******/  context.utils.parseProxiesString = (str = context.outputs.proxiesString) =>
/******/
/******/    str
/******/      .split(/(?:\s*;+\s*)+/g)
/******/      .map((p) => p.trim())
/******/      .filter((p) => p);
/******/      .map((pStr) => {
/******/
/******/        const [type, host] = pStr.split(/\s+/g);
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
/******/  const eventsToActions = ${JSON.stringify(eventsToActions)};
/******/  context.utils.emitEvent = (eventName) => {
/******/
/******/    const actions = eventsToActions[eventName];
/******/    if (!actions) {
/******/      return;
/******/    }
/******/    actions.forEach((action) => {
/******/
/******/      switch(action.action) {
/******/        case 'replace':
/******/          context.outputs.proxiesString =
/******/            context.outputs.proxiesString.replace(
/******/              new RegExp(action.from, 'g'),
/******/              action.to,
/******/            );
/******/          break;
/******/        case 'custom':
/******/          action.handler(context);
/******/          break;
/******/        default:
/******/          throw new TypeError('Unkown action type: ' + action.action);
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
