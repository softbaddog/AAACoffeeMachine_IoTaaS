const request = require('request');
const cfg = require('./config');

// fetch accessToken when longin, and update before timeout
exports.fetchAccessToken = () => {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/sec/v1.1.0/login',
      cert: cfg.cert,
      key: cfg.key,
      form: {
        'appId': cfg.appId,
        'secret': cfg.secret
      },
      strictSSL: false,
      json: true
    };

    request(options, (err, res, body) => {
      if (err) throw err;

      if (res.statusCode === 200) {
        exports.loginInfo = body;
        console.log('fetchAccessToken: ' + JSON.stringify(body));
        resolve();

        setTimeout(() => {
          fetchAccessToken();
        }, body.expiresIn * 1000 * 0.9);
      } else {
        console.log(body);
      }
    });
  });
};