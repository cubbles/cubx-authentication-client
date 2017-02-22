var Promise = require('promise');
var request = require('superagent');
require('superagent-proxy')(request);
var inquirer = require('inquirer');
var urljoin = require('url-join');
var url = require('url');
var authApiPath = '/_api/authenticate';

/**
 * @param url [string] Url of the Cubbles Base (e.g. https://my.base.org)
 * @param stores [array | string] The generated token will contain permissions for these stores.
 * @param user
 * @param password
 * @param next [callback]
 */
module.exports = function (url, stores, user, password, next) {
  'use strict';
  var _url = url;
  var _stores = stores;
  if (arguments.length !== 5) {
    throw new Error('Unexpected number of arguments.');
  }

  function requestForToken (pUrl, pStores, pUser, pPassword) {
    var payload = { stores: pStores, user: pUser, password: pPassword };
    var onEnd = function (err, res, resolve, reject) {
      if (err) {
        reject(err);
      } else if (res) {
        var accessToken, authError;
        accessToken = res.body.access_token; // example: 'eyJ0eXAiOiJ9.eyJ1c2VyIjo.eyJ1c2VyI
        authError = res.headers[ 'www-authenticate' ];
        if (res.body && res.body.access_token) {
          if (accessToken.match(/\./g).length !== 2) {
            reject(new Error('invalid token structure'));
          }
          resolve(accessToken);
        } else if (authError) {
          reject(new Error(authError));
        } else {
          reject(new Error('Received an unexpected response (requested ' + pUrl +
            '). Please check the Url!. \n Response Headers: ' + JSON.stringify(res.headers)));
        }
      } else {
        reject(new Error('Unexpected error requesting ' + pUrl));
      }
    };

    var httpProxy = process.env.http_proxy || process.env.HTTP_PROXY || null;
    var httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY || null;

    if (httpProxy && !isInNoProxyConfig(pUrl) && !isSecure(pUrl)) {
      return new Promise(function (resolve, reject) {
        request
          .post(pUrl)
          .proxy(httpProxy)
          .send(payload)
          .end(function (err, res) {
            onEnd(err, res, resolve, reject);
          });
      });
    } else if (httpsProxy && !isInNoProxyConfig(pUrl) && isSecure(pUrl)) {
      return new Promise(function (resolve, reject) {
        request
          .post(pUrl)
          .proxy(httpsProxy)
          .send(payload)
          .end(function (err, res) {
            onEnd(err, res, resolve, reject);
          });
      });
    } else {
      return new Promise(function (resolve, reject) {
        request
          .post(pUrl)
          .send(payload)
          .end(function (err, res) {
            onEnd(err, res, resolve, reject);
          });
      });
    }
  }

  function getInquirerOptions (defaultUser) {
    var options = {};
    if (defaultUser) {
      options.questions = [
        {
          name: 'password',
          type: 'password',
          message: 'password for user "' + defaultUser + '": ',
          validate: function (input) {
            return (typeof input !== 'undefined' && input.length > 0);
          }
        } ];
    } else {
      options.questions = [
        {
          name: 'user',
          type: 'input',
          message: 'username:',
          validate: function (input) {
            return (typeof input !== 'undefined' && input.length > 0);
          }
        },
        {
          name: 'password',
          type: 'password',
          message: 'password:',
          validate: function (input) {
            return (typeof input !== 'undefined' && input.length > 0);
          }
        } ];
    }
    return options;
  }

  if (!url) {
    throw new Error('Missing parameter "url".');
  }
  if (url.indexOf(authApiPath) < 0) {
    _url = urljoin(url, authApiPath);
  }

// if stores are passed as a comma-separated string
  if (typeof _stores === 'string') {
    _stores = _stores.replace(/\s+/g, '').split(',');
  }

// if not passed, prompt or user and password
  if (!user || !password) {
    inquirer.prompt(getInquirerOptions(user).questions).then(function (result) {
      requestForToken(_url, _stores, result.user, result.password).nodeify(next);
    });
  } else {
    requestForToken(_url, _stores, user, password).nodeify(next);
  }
};

function isInNoProxyConfig (proxyUrl) {
  var noProxy = process.env.NO_PROXY || process.env.no_proxy || null;

  // easy case first - if NO_PROXY is '*'
  if (noProxy === '*') {
    return true;
  }

  // otherwise, parse the noProxy value to see if it applies to the URL
  if (noProxy !== null) {
    var uri = url.parse(proxyUrl);
    var parts = uri.hostname.split(':');
    var hostname = parts[ 0 ];
    var noProxyItem;
    var port;
    var noProxyItemParts;
    var noProxyHost;
    var noProxyPort;
    var noProxyList;

    // canonicalize the hostname, so that 'oogle.com' won't match 'google.com'
    hostname = hostname.replace(/^\.*/, '.').toLowerCase();
    noProxyList = noProxy.split(',');

    for (var i = 0, len = noProxyList.length; i < len; i++) {
      noProxyItem = noProxyList[ i ].trim().toLowerCase();

      // no_proxy can be granular at the port level, which complicates things a bit.
      if (noProxyItem.indexOf(':') > -1) {
        noProxyItemParts = noProxyItem.split(':', 2);
        noProxyHost = noProxyItemParts[ 0 ].replace(/^\.*/, '.');
        noProxyPort = noProxyItemParts[ 1 ];
        port = uri.port || (uri.protocol === 'https:' ? '443' : '80');

        // we've found a match - ports are same and host ends with no_proxy entry.
        if (port === noProxyPort && hostname.indexOf(noProxyHost) === hostname.length - noProxyHost.length) {
          return true;
        }
      } else {
        noProxyItem = noProxyItem.replace(/^\.*/, '.');
        var isMatchedAt = hostname.indexOf(noProxyItem);
        if (isMatchedAt > -1 && isMatchedAt === hostname.length - noProxyItem.length) {
          return true;
        }
      }
    }
  }
  return false;
};

function isSecure (url) {
  if (url.indexOf('http:') === 0) {
    return false;
  }
  if (url.indexOf('https:') === 0) {
    return true;
  }
  throw new Error('The paramater url should have http or https protokol, but the url is.', url);
}
