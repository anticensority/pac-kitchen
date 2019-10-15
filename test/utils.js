import Sandbox from 'sandbox';
import fs from 'fs';

export const evalPacScriptAsync = (pacText, url, hostname, ifDebug) => {

  const code = `
      eval.bind({})(\`
        ${pacText.replace(/(\\|\$|`)/g, '\\$1')};
        FindProxyForURL('${url}', '${hostname}')
      \`);
  `;
  if (ifDebug) {
    fs.writeFileSync('./debug.js', code);
  }
  return new Promise((resolve) =>

    new Sandbox().run(
      code,
      (output) => console.log(output) || resolve(eval(output.result))
    ),
  );
}
