(() => {
  'use strict';

  return {
    pacKitchenVersion: 0,
    pacScript: {
      //urls: ['https://some-url.com', 'https://fallback-url.com'],

      // OR
      text: (function FindProxyForURL(url, hostname) {
        return 'DIRECT';
      }).toString(),

      // OR
/*
      text: `
function FindProxyForURL(url, hostname) {
  return "DIRECT";
}
      `.trim(),
*/
    },
    enabledRules: [
      'ifProhibitDns',
      'ifProxyHttpsUrlsOnly',
      'ifUseSecureProxiesOnly',
      'eitherProxyOrDirect',
      'ifNotToUsePacScriptProxies',
      'ifUseLocalTor',
      'ifMindExceptions',
      'ifProxyMoreDomains',
    ],
    rules: [],
  };
})();
