import Chai from 'chai';
import Mocha from 'mocha';
import { evalPacScriptAsync } from './utils.js';
import { cook } from '../src/pac-engine.mjs'

const simplePacScript = `
  function FindProxyForURL() {
    return 'ABC';
  }
`;

Mocha.describe('PAC Engine', function () {

  Mocha.it('works with no middlewares', async function () {

    Chai.expect(cook, 'to be a function').to.be.a('function');

    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [] });
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('ABC');

  });

  Mocha.it('works with two middlewares appending to the result', async function () {

    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [
      function (context, next) {
        next();
        context.outputs.proxiesString += 'GHI';
      },
      function (context, next) {
        next();
        context.outputs.proxiesString += 'DEF';
      },
    ]});
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('ABCDEFGHI');

  });

  Mocha.it('works with actions', async function () {

    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [], eventToActions: {
      'AFTER_PAC_SCRIPT': [{
        type: 'replaceProxiesString',
        from: 'B',
        to: 'XxXYyYZzZ',
      }],
      'FINISH': [{
        type: 'replaceProxiesString',
        from: 'yY',
        to: 'uU',
      }],
    }});
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = await evalPacScriptAsync(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal('AXxXYuUZzZC');

  });

});



