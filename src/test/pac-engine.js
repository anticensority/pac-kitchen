import Chai from 'chai';
import Mocha from 'mocha';
import { cook } from '../pac-engine.mjs'

const evalPacScript = (pacText, url, hostname) => {
  return eval(pacText + `;
    FindProxyForURL("${url}", "${hostname}");
  `);
}

Mocha.describe('PAC Engine', function () {

  Mocha.it('is exported with correct default values', function () {

    Chai.expect(cook, 'to be a function').to.be.a('function');

    const simplePacScript = `
function FindProxyForURL() {
  return "ABC";
}
    `;
    const simpleCooked = cook({ pacText: simplePacScript, middlewares: [] });
    Chai.expect(simpleCooked).to.be.a('string').that.is.not.empty;

    console.log(simpleCooked);
    const simpleResult = evalPacScript(simpleCooked, 'https://foo.com', 'foo.com');
    Chai.expect(simpleResult).to.equal("ABC");

  });

});



