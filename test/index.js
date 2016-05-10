/* eslint-env node */
'use strict';
var cubxAuthenticationClient = require('../');
var test = require('tape');

test('token: valid request', function (t) {
  var user, stores, pass, url;
  url = 'http://boot2docker.me/_api/authenticate';
  stores = [ 'store1', 'store2' ];
  user = 'cubbles';
  pass = 'todo';

  cubxAuthenticationClient(url, stores, user, pass, function (err, access_token) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(access_token.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: valid request without path', function (t) {
  var user, stores, pass, url;
  url = 'http://boot2docker.me';
  stores = [ 'store1' ];
  user = 'cubbles';
  pass = 'todo';

  cubxAuthenticationClient(url, stores, user, pass, function (err, access_token) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(access_token.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: valid request without stores', function (t) {
  var user, stores, pass, url;
  url = 'http://boot2docker.me';
  stores = [];
  user = 'cubbles';
  pass = 'todo';

  cubxAuthenticationClient(url, stores, user, pass, function (err, access_token) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(access_token.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: valid request with stores undefined', function (t) {
  var user, pass, url;
  url = 'http://boot2docker.me';
  user = 'cubbles';
  pass = 'todo';

  cubxAuthenticationClient(url, undefined, user, pass, function (err, access_token) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(access_token.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: invalid url', function (t) {
  var url, stores, user, pass;
  url = 'http://boot2docker.me/_api/invalid';
  stores = [];
  user = 'todo';
  pass = 'todo';

  cubxAuthenticationClient(url, stores, user, pass, function (err, access_token) {
    if (err) {
      t.ok(err, 'Expected the request to be failed');
      t.end();
      return;
    }
    t.fail(access_token, 'Expected the request to be failed');
    t.end();
  });
});

test('cubxAuthenticationClient: invalid number of arguments', function (t) {
  var url, user, pass;
  url = 'http://boot2docker.me/_api/invalid';
  user = 'todo';
  pass = 'todo';

  try {
    cubxAuthenticationClient(url, user, pass, function (err, access_token) {
      if (err) {
        t.fail(err, 'Expected another error.');
      } else {
        t.fail(access_token, 'Expected another error.');
      }
      t.end();
    });
  } catch (err) {
    t.ok(err.message.indexOf('Unexpected number of arguments.') > -1, '[Error: Unexpected number of arguments.] expected.');
    t.end();
    return;
  }
  t.fail(undefined, 'Expected an error thrown.');
  t.end();
});
