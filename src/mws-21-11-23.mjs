
const pac = {
  /*FROM PAC SCRIPT*/
  wrap: ()=>{},
};


// 1. Block requests. E.g. you may want to block unsafe HTTP (not HTTPS).
const BLOCK = 'HTTP localhost:9';
pac.wrap({
  id: 'ifBlockUnsafeHttp',
  mw: async (context, next) => {
    const ifBlocked = isBlocked(context.inputs.url);
    if (ifBlocked) {
      return BLOCK;
    }
    return next();
  },
});

// 2. Whitelist: list of hostnames we work with, others are ignored.
pac.wrap({
  id: 'ifProxyCensored',
  mw: async (context, next) => {
    const ifCensored = isCensored(context.inputs.url);
    if (ifCensored) {
      return next();
    }
    return 'DIRECT';
  },
});

// 3. Blacklist/Ignore list: lost of hostnames to ignore.
pac.wrap({
    id: 'ifIgnorePopularSites', // E.g. YouTube.
    mw: async (context, next) => {
      const ifPopular = ifPopular(context.inputs.url);
      if (ifPopular) {
        return 'DIRECT';
      }
      return next();
    },
});

// 4. Exceptions from proxying/not proxying.
pac.wrap({
    id: 'ifMindExceptions',
    mw: async (context, next) => {
      const newPacString = await next();
      // `excStatus`: x>0 -- proxy it, x<0 -- don't proxy, x=0 -- block.
      const excStatus = isException(context.inputs.url);
      switch(true) {
        case excStatus > 0: // proxy
          return newPacString;
        case excStatus < 0: // don't
          return 'DIRECT'
        default:
          return BLOCK;
      }
      
    },
});
