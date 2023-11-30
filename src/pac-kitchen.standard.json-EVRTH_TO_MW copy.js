(() => {
  'use strict';

  const torProxies = 'SOCKS5 localhost:9050; SOCKS5 localhost:9150';
  return {
    pacKitchenVersion: 0,
    middlewares: [
      {
        id: 'ifProhibitDns',
        mw: (context, next) => {
          context.inputs.global.dnsResolve = () => null;
          next();
        },
      },
      {
        id: 'ifProxyHttpsUrlsOnly',
        mw: (context, next) => {
          if (!context.inputs.url.startsWith('https://')) {
            return 'DIRECT';
          }
          next();
        },
      },
      {
        id: 'ifUseSecureProxiesOnly',
        mw: (context, next) => {
          next();
          return context.utils.parseProxiesString()
            .filter(({ type, hostname }) => {
              if (['HTTPS', 'DIRECT'].includes(type) || hostname === 'localhost') {
                return true;
              }
              return false;
            })
            .map(({ type, host = '' }) => `${type} ${host}`)
            .join('; ');
        },
      },
      {
        id: 'eitherProxyOrDirect',
        mw: (context, next) => {
          next();
          return context.utils.parseProxiesString()
            .filter(({ type }) => type !== 'DIRECT')
            .map(({ type, host = '' }) => `${type} ${host}`)
            .join(';') || 'DIRECT';
        },
      },
      {
        id: 'ifNotToUsePacScriptProxies',
        mw: (context, next) => {
          next();
          return context.utils.parseProxiesString()
            .replace(
              new RegExp('.*', 'g'),
              '',
            );
        },
      },
      {
        id: 'ifUseLocalTor',
        options: {
          torReplace: `${torProxies}; $&`,
        },
        eventToQueues: {
          'PROXY_THIS_EXCEPTION': [{
            actions: [{
              type: 'custom',
              handler: (context) => {

                context.outputs.ifTorSet = true;
                return context.outputs.proxiesString.replace(/.*/g, context.inputs.options.torReplace);
              },
            }],
          }],
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
            queueAt: 'beginning',
          }],
        },
        order: 800,
      },
      {
        id: 'ifMindExceptions',
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
        id: 'ifProxyMoreDomains',
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
