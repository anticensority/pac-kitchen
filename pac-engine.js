'use strict';

{

  const kitchenStartsMark = '\n\n//%#@@@@@@ PAC_KITCHEN_STARTS @@@@@@#%';

  const cook = ({ pacText, middlewares, options = {} }) => {

      pacText = pacText.replace(
        new RegExp(kitchenStartsMark + '[\\s\\S]*$', 'g'),
        ''
      );
      /a/.test('a'); // GC RegExp.input and friends.

      return options.ifNoMods ? pacText : pacText + `${ kitchenStartsMark }
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
/******/      outputs.proxiesString = FindProxyForURL(...);
/******/    }
/******/  }
/******/
/******/  const originalFindProxyForURL = FindProxyForURL;
/******/  const tmp = function(url, host) {
/******/
/******/    Object.assign(context.inputs, { url, host });
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
}
