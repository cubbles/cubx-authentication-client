/* eslint-env node */
var Promise = require('promise')
var request = require('superagent')
var inquirer = require('inquirer')
var urljoin = require('url-join')
var authApiPath = '/_api/authenticate'

module.exports = function (url, user, password, next) {
  'use strict'
  var _url = url

  function requestForToken (pUrl, pUser, pPassword) {
    return new Promise(function (resolve, reject) {
      request
        .post(pUrl)
        .send({ user: pUser, password: pPassword })
        .end(function (err, res) {
            if (err) {
              reject(err)
            } else if (res) {
              var access_token, authError
              access_token = res.body.access_token // example: 'eyJ0eXAiOiJ9.eyJ1c2VyIjo.eyJ1c2VyI
              authError = res.headers[ 'www-authenticate' ]
              if (res.body && res.body.access_token) {
                if (access_token.match(/\./g).length !== 2) {
                  reject(new Error('invalid token structure'))
                }
                resolve(access_token)
              } else if (authError) {
                reject(new Error(authError))
              } else {
                reject(new Error('Received an unexpected response (requested ' + pUrl +
                  '). Please check the Url!. \n Response Headers: ' + JSON.stringify(res.headers)))
              }
            } else {
              reject(new Error('Unexpected error requesting ' + pUrl))
            }
          }
        )
    })
  }

  function getInquirerOptions (defaultUser) {
    var options = {}
    if (defaultUser) {
      options.questions = [
        {
          name: 'password',
          type: 'password',
          message: 'password for user "' + defaultUser + '": ',
          validate: function (input) {
            return (typeof input !== 'undefined' && input.length > 0)
          }
        } ]

    } else {
      options.questions = [
        {
          name: 'user',
          type: 'input',
          message: 'username:',
          validate: function (input) {
            return (typeof input !== 'undefined' && input.length > 0)
          }
        },
        {
          name: 'password',
          type: 'password',
          message: 'password:',
          validate: function (input) {
            return (typeof input !== 'undefined' && input.length > 0)
          }
        } ]

    }
    return options
  }

  if (!url) {
    throw new Error('Missing parameter "url".')
  }
  if (url.indexOf(authApiPath) < 0) {
    _url = urljoin(url, authApiPath)
  }

  if (!user || !password) {
    inquirer.prompt(getInquirerOptions(user).questions, function (result) {
      requestForToken(_url, result.user, result.password).nodeify(next)
    })
  } else {
    requestForToken(_url, user, password).nodeify(next)
  }
}
