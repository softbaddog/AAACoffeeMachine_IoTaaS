const request = require('request');
const cfg = require('./config');
const msgpack = require('msgpack5')();

// fetch accessToken when longin, and update before timeout
exports.deviceCommands = (loginInfo, deivceId, data) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/cmd/v1.4.0/deviceCommands?appId=' + cfg.appId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId
      },
      body: {
        deviceId: deivceId,
        command: {
          serviceId: 'RawData',
          method: 'CMD',
          paras: {
            // CMDDATA: msgpack.encode(data).toString('base64')
            rawData: Buffer.from(data.Func).toString('base64')
          }
        },
        expireTime: 100
      },
      strictSSL: false,
      json: true
    };

    console.log(JSON.stringify(options.body));

    request(options, (err, res, body) => {
      if (err) throw err;

      if (res.statusCode === 201) {
        resolve();
      } else {
        console.log(body);
      }
    });
  });
};