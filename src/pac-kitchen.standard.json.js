(() => {
  'use strict';

  const torProxies = 'SOCKS5 localhost:9050; SOCKS5 localhost:9150';
  return {
    pacKitchenVersion: 0,
    rules: [
      {
        label: 'ifProhibitDns',
        eventToQueues: {
          'START': [{
            actions: [{
              type: 'custom',
              handler: (context) => {

                context.inputs.global.dnsResolve = () => null;
              },
            }],
            queueAt: 'begining',
          }],
        },
        order: -1000,
      },
      {
        label: 'ifProxyHttpsUrlsOnly',
        middlewares: [(context, next) => {

          if (!context.inputs.url.startsWith('https://')) {
            return 'DIRECT';
          }
          next();
        }],
        order: -900,
      },
      {
        label: 'ifUseSecureProxiesOnly',
        eventToQueues: {
          'FINISH': [{
            actions: [{
              type: 'custom',
              handler: (context) => {

                return context.utils.parseProxiesString()
                  .filter(({ type, hostname }) => {

                    if (['HTTPS', 'DIRECT'].includes(type) || hostname === 'localhost') {
                      return true;
                    }
                    return false;
                  }).join(';');
              },
            }],
            queueAt: 'ending',
          }],
        },
        order: 900,
      },
      {
        label: 'eitherProxyOrDirect',
        eventToQueues: {
          'FINISH': [{
            actions: [{
              type: 'custom',
              handler: (context) => {

                return context.utils.parseProxiesString()
                  .filter(({ type }) => type !== 'DIRECT')
                  .join(';') || 'DIRECT';
              },
            }],
            queueAt: 'ending',
          }],
        },
        order: 1000,
      },
      {
        label: 'ifNotToUsePacScriptProxies',
        eventToQueues: {
          'AFTER_PAC_SCRIPT': {
            actions: [{
              type: 'replaceProxiesString',
              from: '.*',
              to: '',
            }],
            queueAt: 'begining',
          }
        },
        order: 0,
      },
      {
        label: 'ifUseLocalTor',
        options: {
          torReplce: `${torProxies}; $&`,
        },
        eventToQueues: {
          'PROXY_THIS_EXCEPTION': {
            actions: [{
              type: 'custom',
              handler: (context) => {

                context.outputs.ifTorSet = true;
                return context.outputs.proxiesString.replace(/.*/g, context.inputs.options.torReplace);
              },
            }],
          },
          'FINISH': [{
            actions: [{
              type: 'custom',
              handler: (context) => {

                if (!context.outputs.ifTorSet && !/(?:\s|;)*DIRECT(?:\s|;)*/g.test(context.outputs.proxiesString)) {
                  return context.outputs.proxiesString.replace(
                    /.*/g,
                    context.inputs.options.torReplace,
                  );
                }
              },
            }],
            queueAt: 'begining',
          }],
        },
        order: 800,
      },
      {
        label: 'ifMindExceptions',
        options: {
          exceptions: {
            // 'kasparov.ru': true, // Proxy.
            // 'grani.ru': false,   // Don't proxy.
          },
        },
        emitsEvents: ['PROXY_THIS_EXCEPTION'],
        middlewares: [(context, next) => {

          const dotHostname = '.' + context.inputs.hostname;
          const isHostnameInDomain = (domain) => dotHostname.endsWith('.' + domain);
          const domainReducer = (maxWeight, [domain, ifIncluded]) => {

            if (!isHostnameInDomain(domain)) {
              return maxWeight;
            }
            const newWeightAbs = domain.length;
            if (newWeightAbs < Math.abs(maxWeight)) {
              return maxWeight;
            }
            return newWeightAbs*(ifIncluded ? 1 : -1);

          };

          const excWeight = Object.entries(context.inputs.options.exceptions).reduce(domainReducer, 0);
          if (!excWeight) {
            return next();
          }
          if (excWeight > 0) {
            context.utils.emitEvent('PROXY_THIS_EXCEPTION');
            return;
          }
          context.outputs.proxiesString = 'DIRECT';
          context.utils.emitEvent('DONT_PROXY_THIS_EXCEPTION');
        }],
      },
      {
        label: 'ifProxyMoreDomains',
        options: {
          exceptions: {
            'onion': true,
            'i2p': true,
            // TODO: add more.
          },
        },
      },
    ],
  };
})();
