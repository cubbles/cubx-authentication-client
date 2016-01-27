# cubx-authentication-client

[![npm][npm-image]][npm-url]

This lib is part of the Cubbles platform. Use this lib to request an 'access_token' for Client > Base -interactions.

## Install

```sh
$ npm install --save cubx-authentication-client
```

## Usage

```js
var cubxAuthenticationClient = require('cubx-authentication-client');
cubxAuthenticationClient('https://<your-cubbles-base-host>/_api/auth', 'store1', 'username', 'password',  function(err, access_token) {...});
```

## CLI
```sh
# install
$ npm install --global cubx-authentication-client

# usage instructions
$ cubx-authentication-client
```

## Contribution

### Code Style
We follow the _JavaScript Standard Style_: http://standardjs.com/

### Testing
Currently testcases require a Cubble-Base-Instance available at http://boot2docker.me.
Contact the author, if your have questions on how to setup a Base locally.

### Pre-Commit Hooks
To make sure, only correctly styled and tested code will be commited, we use _pre-commit_ hooks managed with the npm-module ```pre-commit```.  

On **Windows**, installing the _pre-commit_ -hook fails with a message like ```pre-commit: EPERM: operation not permitted, symlink ...```
To create the symlink, please open a cmd 'as administrator' and run ```npm install```. Check the ```.git/hooks``` folder for the new created symlink.
  

## Notes
Project has been generated using https://github.com/maurizzzio/generator-node-npm

## License

2016 Apache-2.0 © [Cubbles](https://github.com/cubbles)

[npm-image]: https://img.shields.io/npm/v/cubx-authentication-client.svg?style=flat
[npm-url]: https://npmjs.org/package/cubx-authentication-client
