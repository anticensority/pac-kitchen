import { cook } from './pac-engine.mjs'
/*
    ifProxyHttpsUrlsOnly: {
      dflt: false,
      label: 'проксировать только HTTP<em>S</em>-сайты',
      desc: 'Проксировать только сайты, доступные по шифрованному протоколу HTTP<em>S</em>. Прокси и провайдер смогут видеть только адреса проксируемых HTTP<em>S</em>-сайтов, но не их содержимое. Используйте, если вы не доверяете прокси-серверам ваш HTTP-трафик. Разумеется, что с этой опцией разблокировка HTTP-сайтов работать не будет.',
      order: 0,
    },
*/
const ifProxyHttpsUrlsOnly = (ctx, next) => {

  if (!ctx.inputs.url.startsWith('https://')) {
    ctx.outputs.proxiesString = 'DIRECT';
    return;
  }
  next();
};
/*
    ifUseSecureProxiesOnly: {
      dflt: false,
      label: 'только шифрованная связь с прокси',
      desc: 'Шифровать соединение до прокси от провайдера, используя только прокси типа HTTPS или локальный Tor. Провайдер всё же сможет видеть адреса (но не содержимое) проксируемых ресурсов из протокола DNS (даже с Tor). Опция вряд ли может быть вам полезна, т.к. шифруется не весь трафик, а лишь разблокируемые ресурсы.',
      order: 1,
    },
*/
const ifUseSecureProxiesOnly = (ctx, next) => {
  // TODO: mutate result as array.
};
/*
    ifProhibitDns: {
      dflt: false,
      label: 'запретить опредление по IP/DNS',
      desc: 'Пытается запретить скрипту использовать DNS, без которого определение блокировки по IP работать не будет (т.е. будет разблокироваться меньше сайтов). Используйте, чтобы получить прирост в производительности или если вам кажется, что мы проксируем слишком много сайтов. Запрет действует только для скрипта, браузер и др.программы продолжат использование DNS.',
      order: 2,
    },
*/
const ifProhibitDns = (ctx, next) => {
  ctx.inputs.global.dnsResolve = () => null;
};
/*
    ifProxyOrDie: {
      dflt: true,
      ifDfltMods: true,
      label: 'проксируй или умри!',
      desc: 'Запрещает соединение с сайтами напрямую без прокси в случаях, когда все прокси отказывают. Например, если все ВАШИ прокси вдруг недоступны, то добавленные вручную сайты открываться не будут совсем. Однако смысл опции в том, что она препятствует занесению прокси в чёрные списки Хрома. Рекомендуется не отключать.',
      order: 3,
    },
*/
const ifProxyOrDie = (ctx, next) => {
  // TODO: mutate results.
};
/*
    ifUsePacScriptProxies: {
      dflt: true,
      category: 'ownProxies',
      label: 'использовать прокси PAC-скрипта',
      desc: 'Использовать прокси-сервера от авторов PAC-скрипта.',
      order: 4,
    },
*/
const ifUsePacScriptProxies = (ctx, next) => {
  // TODO: turn off proxies by group/label/set.
};
/*
    ifUseLocalTor: {
      dflt: false,
      category: 'ownProxies',
      label: 'использовать СВОЙ локальный Tor',
      desc: 'Установите <a href="https://rebrand.ly/ac-tor">Tor</a> на свой компьютер и используйте его как прокси-сервер. <a href="https://rebrand.ly/ac-tor">ВАЖНО</a>',
      order: 5,
    },
    exceptions: {
      category: 'exceptions',
      dflt: null,
    },
    ifMindExceptions: {
      dflt: true,
      category: 'exceptions',
      label: 'учитывать исключения',
      desc: 'Учитывать сайты, добавленные вручную. Только для своих прокси-серверов! Без своих прокси работать не будет.',
      order: 6,
    },
    customProxyStringRaw: {
      dflt: '',
      category: 'ownProxies',
      label: 'использовать СВОИ прокси',
      url: 'https://rebrand.ly/ac-own-proxy',
      order: 7,
    },
    ifProxyMoreDomains: {
      ifDisabled: true,
      dflt: false,
      category: 'ownProxies',
      label: 'проксировать .onion, .i2p и <a href="https://en.wikipedia.org/wiki/OpenNIC#OpenNIC_TLDs">OpenNIC</a>',
      desc: 'Проксировать особые домены. Необходима поддержка со стороны СВОИХ прокси.',
      order: 8,
    },
    ifReplaceDirectWith: {}
*/

