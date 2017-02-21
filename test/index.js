/* eslint-env node */
'use strict';
var cubxAuthenticationClient = require('../');
var test = require('tape');

/**
 * Note: Those tests require a user to be already exist (sorry for that).
 *       You can create the user manually by adding the following as new document into the '_users' database:
         {
           "_id": "org.couchdb.user:cubbles",
           "name": "cubbles",
           "logins": {
               "local": {
                   "login": "cubbles"
               }
           },
           "roles": [
           ],
           "type": "user",
           "pasword": "simple"
        }
 */

test('token: valid request', function (t) {
  var user, stores, pass, url;
  url = 'http://cubbles-base-local/_api/authenticate';
  stores = [ 'store1', 'store2' ];
  user = 'cubbles';
  pass = 'simple';

  cubxAuthenticationClient(url, stores, user, pass, function (err, accessToken) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(accessToken.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: valid request without path', function (t) {
  var user, stores, pass, url;
  url = 'http://cubbles-base-local';
  stores = [ 'store1' ];
  user = 'cubbles';
  pass = 'simple';

  cubxAuthenticationClient(url, stores, user, pass, function (err, accessToken) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(accessToken.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: valid request without stores', function (t) {
  var user, stores, pass, url;
  url = 'http://cubbles-base-local';
  stores = [];
  user = 'cubbles';
  pass = 'simple';

  cubxAuthenticationClient(url, stores, user, pass, function (err, accessToken) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(accessToken.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: valid request with stores undefined', function (t) {
  var user, pass, url;
  url = 'http://cubbles-base-local';
  user = 'cubbles';
  pass = 'simple';

  cubxAuthenticationClient(url, undefined, user, pass, function (err, accessToken) {
    if (err) {
      t.fail(err);
      t.end();
      return;
    }
    // console.log(success);
    t.ok(accessToken.match(/\./ig).length === 2, 'expecting to find two dots within the token');
    t.end();
  });
});

test('cubxAuthenticationClient: invalid url', function (t) {
  var url, stores, user, pass;
  url = 'http://cubbles-base-local/_api/invalid';
  stores = [];
  user = 'simple';
  pass = 'simple';

  cubxAuthenticationClient(url, stores, user, pass, function (err, accessToken) {
    if (err) {
      t.ok(err, 'Expected the request to be failed');
      t.end();
      return;
    }
    t.fail(accessToken, 'Expected the request to be failed');
    t.end();
  });
});

test('cubxAuthenticationClient: invalid number of arguments', function (t) {
  var url, user, pass;
  url = 'http://cubbles-base-local/_api/invalid';
  user = 'simple';
  pass = 'simple';

  try {
    cubxAuthenticationClient(url, user, pass, function (err, accessToken) {
      if (err) {
        t.fail(err, 'Expected another error.');
      } else {
        t.fail(accessToken, 'Expected another error.');
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
