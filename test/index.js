/* eslint-env node */
'use strict'
var cubxAuthenticationClient = require('../')
var test = require('tape')

test('token: valid request', function (t) {
  var user, pass, url
  url = 'http://boot2docker.me/_api/authenticate'
  user = 'cubbles'
  pass = 'todo'

  cubxAuthenticationClient(url, user, pass, function (err, access_token) {
    if (err) {
      t.fail(err)
      t.end()
      return
    }
    // console.log(success);
    t.ok(access_token.match(/\./ig).length === 2, 'expecting to find two dots within the token')
    t.end()
  })
})

test('token: valid request without path', function (t) {
  var user, pass, url
  url = 'http://boot2docker.me'
  user = 'cubbles'
  pass = 'todo'

  cubxAuthenticationClient(url, user, pass, function (err, access_token) {
    if (err) {
      t.fail(err)
      t.end()
      return
    }
    // console.log(success);
    t.ok(access_token.match(/\./ig).length === 2, 'expecting to find two dots within the token')
    t.end()
  })
})

test('token: invalid url', function (t) {
  var url, user, pass
  url = 'http://boot2docker.me/_api/invalid'
  user = 'todo'
  pass = 'todo'

  cubxAuthenticationClient(url, user, pass, function (err, access_token) {
    if (err) {
      t.ok(err, 'Expected the request to be failed')
      t.end()
      return
    }
    t.fail(access_token, 'Expected the request to be failed')
    t.end()
  })
})
