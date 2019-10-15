import Chai from 'chai';
import Mocha from 'mocha';
import { evalPacScriptAsync } from './utils.js';
import { cook } from '../src/pac-kitchen.mjs';
import { readJson } from '../src/json-reader.mjs';

const simplePacScript = `
  function FindProxyForURL() {
    return 'ABC';
  }
`;

const simpleCustom = {
  pacKitchenVersion: 0,
  enabledRules: [],
  pacScript: {
    text: simplePacScript,
  },
};

const makeOneRuler = (rule, pacText = simplePacScript) => {

  const config = Object.assign({}, simpleCustom);
  config.pacScript.text = pacText;
  config.enabledRules = [rule];
  return config;
};

const standard = readJson('./src/pac-kitchen.standard.json');

Mocha.describe('PAC Kitchen', function () {

  Mocha.it('works with no rules', async function () {

    Chai.expect(cook, 'to be a function').to.be.a('function');

    const simpleCooked = cook(standard, simpleCustom);
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('ABC');

  });

  Mocha.it('works with ifProhibitDns', async function () {

    const simpleCooked = cook(standard, makeOneRuler('ifProhibitDns', `
      function FindProxyForURL() {
        const ip = dnsResolve('http://localhost');
        return ip;
      }
    `));
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal(null);

  });

  Mocha.it('works with ifProxyHttpsUrlsOnly', async function () {

    const simpleCooked = cook(standard, makeOneRuler('ifProxyHttpsUrlsOnly'));
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('ABC');

    const simpleResult2 = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult2).to.equal('DIRECT');

  });

  Mocha.it('works with ifUseSecureProxiesOnly', async function () {

    const simpleCooked = cook(standard, makeOneRuler('ifUseSecureProxiesOnly', `
      function FindProxyForURL() {
        return 'PROXY deleteme:1111; SOCKS deleteme:2222; HTTPS leaveme:3333; PROXY localhost:4444; PROXY deleteme:5555';
      }
    `));
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('HTTPS leaveme:3333; PROXY localhost:4444');

  });

  Mocha.it('works with eitherProxyOrDirect', async function () {

    const simpleCooked = cook(standard, makeOneRuler('eitherProxyOrDirect', `
      function FindProxyForURL() {
        return 'ABC; DIRECT';
      }
    `));
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult.trim()).to.equal('ABC');

    const simpleCooked2 = cook(standard, makeOneRuler('eitherProxyOrDirect', `
      function FindProxyForURL() {
        return 'DIRECT';
      }
    `));
    Chai.expect(simpleCooked2).to.be.a('string').that.is.not.empty;

    const simpleResult2 = await evalPacScriptAsync(simpleCooked2, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult2.trim()).to.equal('DIRECT');

  });

  Mocha.it('works with ifNotToUsePacScriptProxies', async function () {

    const simpleCooked = cook(standard, makeOneRuler('ifNotToUsePacScriptProxies'));
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('');

  });

  Mocha.it('works with ifUseLocalTor', async function () {

    const tor1 = 'SOCKS5 localhost:9050';
    const tor2 = 'SOCKS5 localhost:9150';
    const simpleCooked = cook(standard, makeOneRuler('ifUseLocalTor'));
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'http://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.include(tor1).and.include(tor2);

  });

  Mocha.it('works with ifMindExceptions', async function () {

    const custom = makeOneRuler('ifMindExceptions');
    const proxycom = 'proxyme.com';
    const dontproxycom = 'dontproxyme.com';
    custom.rules.push({
      id: 'userExceptions',
      options: {
        exceptions: {
          [proxycom]: true,
          [dontproxycom]: false,
        },
      },
      eventToQueues: {
        'PROXY_THIS_EXCEPTION': [{
          actions: [{
            type: 'replaceProxiesString',
            to: 'SUPERPROXY',
          }],
        }]
      },
    });
    custom.enabledRules.push('userExceptions');
    const simpleCooked = cook(standard, custom);
    console.log(simpleCooked);
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, `http://${dontproxycom}`, dontproxycom);
    Chai.expect(simpleResult).to.equal('DIRECT');

    const simpleResult2 = await evalPacScriptAsync(simpleCooked, `http://${proxycom}`, proxycom);
    Chai.expect(simpleResult2).to.equal('SUPERPROXY');

  });

});



