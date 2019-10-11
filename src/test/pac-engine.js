import Chai from 'chai';
import Mocha from 'mocha';
import { cook } from '../pac-engine.mjs'

const evalPacScript = (pacText, url, hostname) => {
  return eval.call({}, pacText + `;
    FindProxyForURL("${url}", "${hostname}");
  `);
}

const simplePacScript = `
  function FindProxyForURL() {
    return "ABC";
  }
`;

Mocha.describe('PAC Engine', function () {

  Mocha.it('works with no middlewares', function () {

    Chai.expect(cook, 'to be a function').to.be.a('function');

    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [] });
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = evalPacScript(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal("ABC");

  });

  Mocha.it('works with two middlewares appending to the result', function () {

    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [
      function (context, next) {
        next();
        context.outputs.proxiesString += "GHI";
      },
      function (context, next) {
        next();
        context.outputs.proxiesString += "DEF";
      },
    ]});
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = evalPacScript(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal("ABCDEFGHI");

  });

  Mocha.it('works with actions', function () {

    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [], eventToActions: {
      'AFTER_PAC_SCRIPT': [{
        action: 'replaceProxiesString',
        from: 'B',
        to: 'XxXYyYZzZ',
      }],
      'FINISH': [{
        action: 'replaceProxiesString',
        from: 'yY',
        to: 'uU',
      }],
    }});
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    const simpleResult = evalPacScript(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal("AXxXYuUZzZC");

  });

});



