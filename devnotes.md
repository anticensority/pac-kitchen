The idea of this project is to apply middlewares to PAC-scripts.

### 

(url, hostname, prevPacString, context, next)

### MIDDLEWARE TARGETS (PAC-FUNCTIONS)

1) A typical middleware chain has only one target. It may be a dom element targeted by an event, http server response emittment or a targeted PAC-script execution.
2) Abstractly PAC-script may be seen as a function that takes `(url, hostname, previousPacString)` and returns a modified PAC-string. PAC-string is a string that contains proxy addresses to be tried and used for a given url/hostname. For the main `FindProxyForURL` function of any standard PAC-script `previousPacString` is undefined. Hereafter such functions as abstrct PAC-scripts will be referenced as just PAC-functions.
3) PAC-functions may be composed/mixed together inside one PAC-script file.
4) What if middlewares may be used with more that one target? E.g. targets may be several PAC-functions used in one PAC-script file. It may be convenient to, e.g., has separate PAC-functions for .onion urls and for standard DNS TLDs. Each such PAC-function may be a target
for middlewares. Middlewares are attached to PAC-functions as handlers to different events
or as tranditional middlewares to different http (method, path) pairs within one server like in ExpressJS.
5) Examples of PAC-functions:
  A) The main `FindProxyForURL` of a PAC-script.
  B) A function that takes a set of proxying exceptions, which is used to decide for a given url to
     be proxied (returns unmodified `previousPacString`) or not (returns `DIRECT` for the url to be not proxied or terminates middleware chain by not calling `next()`).
  c) TODO:
TODO:

For simplicity let's have only one external PAC-function.
How to implement proxying exceptions for it?
 
1) via middleware
2) via another PAC-function

How PAC-functions composed together?

1) Sequentially: PAC-string is passed from prev.output to next input.
2) 




Definition of PAC-function
--------------------------

PAC-string is a string that contains proxy addresses to be tried and used for a given url/hostname.

PAC-function is a function that takes `(url, hostname, previousPacString = 'DIRECT')` and returns a modified PAC-string. If `previousPacString` is undefined then it should be assigned a value of an
empty string.

The main `FindProxyForURL` function of any standard PAC-script is a PAC-function with `previousPacString` set as 'DIRECT'.

Middleware is a function with signature `(context, next)`.
PAC-functions may be easily converted to a middleware and vice verse.

Use cases
---------

Case A:
Detect if the hostname is local. All local hostnames must return PAC-string 'DIRECT'.

Case B:
Detect if the hostname is censored (belongs to a registry). Return proxies in PAC-string to circumvent censorship. The registry may be different for different countries.

Case C:
Detect if tne hostname belongs to the Onion-network (or other non-standard network).
Return proxies that support such addresses (.onion, e.g.).

Case D (Work only with sites from the whitelist, other sites are in auto mode):
User may provide a white list. At the same time proxies may not be provided by the user and instead
proxies of other PAC-functions must be used if it's possible.
* White list is checked before any other PAC-functions for the sake of speed (e.g., it's easier to
check hostname in a small whitelist than check it in a big anti-censorship list).
* Algo:
  1) Check if present in the whitelist. Auto if not.
  2) Feed whitelisted hostname to other PAC-functions of user choice. These PAC-functions should provide the PAC-string.

Case E (blacklist -- never proxy it):
If in list return auto.

Case F (stoplist -- block the request):
Detect if the hostname is used for advertisments. PAC-string may contiain `HTTP 127.0.0.1:9` (a blackhole, see https://en.wikipedia.org/wiki/Discard_Protocol) that rejects all the requests which result in ad request being blocked.


Case G (exceptions from PAC-function):
In this case we want to change results of some previous PAC-function.
We have three lists: 1) whitelist: always pass these addresses to the next PAC-function, proxy may not be provided 2) blacklist: never proxy it, use auto mode, 3) block-list: block the request.
Algo:
 1) Check the whitelist. Return auto if not present.
 2) Feed the hostname to the blacklist PAC-function. Return auto if present.
 3) Check stoplist. Return blackhole for sites in the list.
 3) Call some other PAC-function (main) which makes a decision.
 4) Return the main PAC-function result.


Case H: adblocker + anti-censorship

PAC-file 1: adblocker
PAC-file 2: anti-censorshiop

mw -> mw -> adblocker -> anti-censorship->|
mw <- mw <- adblocker <- anti-censorship<-|

###### adblocker

FindProxyForURL(url, hostname) {
  //...
  return 'HTTP 127.0.0.1:9';
  // OR
  return 'DIRECT';
}

(context, next) => {

  const adProxyString = FindProxyForURL(url, hostname); // Adblocker.
  // Returns 'DIRECT' or 'HTTP 127.0.0.1:9' (or similar, may vary).
  const adProxyArray = toProxyArray(adProxyString);
  if (isBlocked(adProxyArray)) {
    return [BLOCK];
  }
  const nextProxyArray = next(); // Next mw which may be anti-censorship PAC-function.
  return nextProxyArray();
}

##### adblocker for proxied addresses only

1) Decide if to proxy and what proxy to use.
2) For the same proxied url check if it is ad and block it if necessary.

FindProxyForURL(url, context.hostname) {
  if (!isCensored(hostname)) {
    return 'DIRECT';
  }
  return 'HTTPS foo.example.com';
}

(context, next) => {

  const acProxyString = FindProxyForURL(url, hostname); // anti-censorship.
  // Returns 'DIRECT' or proxy address.
  const acProxyArray = toProxyArray(acProxyString);
  if (!isCensored(acProxyArray)) {
    return ['DIRECT'];
  }
  const nextProxyArray = next(); // Next mw which may be adblocker PAC-function.
  if (isBlocked(nextProxyArray)) {
    return [BLOCK];
  }
  return acProxyArray();
}

Composing PAC-functions
-----------------------

1) Direct chaining (case H).




Conversion
----------

1) PAC-script is not required to be edited anyway before usage in the final function.
2) `FindProxyForURL`'s definition may be obfuscated and/or be malicious.

Is it possile to combine functions in a safe way?
Let's keep this question out of what we do, we just won't ship this feature currently.

3) Still, the architecture of PAC-functions and middlewares must leave space for features planned for the future.



/*
const finalMw = (context = { url, hostname }, next = () => {}) {
  const pacString = FindProxyForURL(context.url, context.hostname);
  return next();
}
*/

function FindProxyForURL(url, hostname, proxyArray = [], next = (() => {})) {

}


Events
------

1) PAC-script evaluation starts.
2) PAC-script evaluation finishes.
2) FindProxyxyForURL starts.
3) FindProxyxyForURL returns.