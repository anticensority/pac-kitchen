const kitchenStartsMark = '\n\n//%#@@@@@@ PAC_KITCHEN_STARTS @@@@@@#%';

export const cook = ({ pacText, middlewares, options = {} }) => {

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
/******/  const middlewares = ${JSON.stringify(middlewares, null, 2)};
/******/
/******/  const context = {
/******/    inputs: {
/******/      options: ${JSON.stringify(options, null, 2)},
/******/    },
/******/    outputs: {},
/******/  };
/******/
/******/  let i = 0;
/******/  const next = () => {
/******/    if (i < middlewares.length) {
/******/      middlewares[i++](context, next);
/******/    } else {
/******/      outputs.proxiesString = FindProxyForURL(
/******/        context.inputs.url,
/******/        context.inputs.hostname,
/******/      );
/******/    }
/******/  }
/******/
/******/  const originalFindProxyForURL = FindProxyForURL;
/******/  const tmp = function(url, hostname) {
/******/
/******/    Object.assign(context.inputs, { url, hostname });
/******/    next();
/******/    return outputs.proxiesString;
/******/  }
/******/  if (global) {
/******/    global.FindProxyForURL = tmp;
/******/  } else {
/******/    FindProxyForURL = tmp;
/******/  }
/******/
/******/})(this);`;

};
