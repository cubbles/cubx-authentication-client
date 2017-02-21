var Promise = require('promise');
var request = require('superagent');
require('superagent-proxy')(request);
var inquirer = require('inquirer');
var urljoin = require('url-join');
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

    if (process.env.http_proxy) {
      return new Promise(function (resolve, reject) {
        request
          .post(pUrl)
          .proxy(process.env.http_proxy)
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
