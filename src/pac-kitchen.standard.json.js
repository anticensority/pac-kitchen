(() => {
  'use strict';

  return {
    pacKitchenVersion: 0,
    rules: [
      {
        label: 'ifProhibitDns',
        eventToActions: {
          'START': {
            actions: [(context, next) => {

              context.inputs.global.dnsResolve = () => null;
            }],
            queueAt: 'begining',
          },
        },
        order: -1000,
      },
      {
        label: 'ifProxyHttpsUrlsOnly',
        middlewares: [(context, next) => {

          if (!context.inputs.url.startsWith('https://')) {
            context.outputs.proxiesString = 'DIRECT';
            return;
          }
          next();
        }],
        order: -900,
      },
      {
        label: 'ifUseSecureProxiesOnly',
        eventToActions: {
          'FINISH': [{
            action: 'custom',
            handler: (context, next) => {

              context.outputs.proxiesString = context.outputs.proxiesString.split(); // TODO:
            },
          }],
        },
        order: 900,
      },
      {
        label: 'ifProxyOrDie',
        middlewares: [(context, next) => {
        // TODO: mutate results.
        }],
        order: 1000,
      },
      {
        label: 'ifUsePacScriptProxies',
        middlewares: [(context, next) => {
          // TODO: turn off proxies by group/label/set.
        }],
        order: 0,
      },
      {
        label: 'ifUseLocalTor',
        eventToActions: {}, // TODO:
        order: 800,
      },
      {
        label: 'ifMindExceptions',
        options: {
          exceptions: [],
        },
        emitsEvents: ['PROXY_THIS_EXCEPTION'],
        middlewares: [(context, next) => {

          if (context.inputs.options.exceptions.includes(context.inputs.hostname)) {
            context.utils.emitEvent('PROXY_THIS_EXCEPTION');
          }
          next();
        }],
      },
      {
        label: 'ifProxyMoreDomains',
        options: {
          exceptions: ['.onion', '.i2p'],
        },
      },
    ],
  };
})();
