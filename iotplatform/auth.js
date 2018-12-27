const request = require('request');
const cfg = require('./config');

const url = 'https://' + cfg.host + ':' + cfg.port;

const options = (mode) => {
  if (mode == 'old') {
    return {
      method: 'POST',
      url: url + '/iocm/app/sec/v1.1.0/login',
      cert: cfg.cert,
      key: cfg.key,
      form: {
        appId: cfg.appId,
        secret: cfg.secret
      },
      strictSSL: false,
      json: true
    };
  } else {
    return {
      method: 'POST',
      url: url + '/api/v3.0/auth/tokens',
      cert: cfg.cert,
      key: cfg.key,
      body: {
        key: cfg.appId,
        secret: cfg.secret
      },
      strictSSL: false,
      json: true
    };
  }
};

// fetch accessToken when longin, and update before timeout
exports.fetchAccessToken = (mode) => {
  return new Promise((resolve, reject) => {
    request(options(mode), (err, res, body) => {
      if (err) console.log(err);
      if (res.statusCode === 200) {
        exports.loginInfo = body;
        console.log('fetchAccessToken: ' + JSON.stringify(body));
        resolve(body);
        // update token periodicity
        setTimeout(() => {
          this.fetchAccessToken(mode);
        }, body.expiresIn * 1000 * 0.9);
      } else {
        console.log(body);
      }
    });
  });
};