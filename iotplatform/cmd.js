const request = require('request');
const cfg = require('./config');
const msgpack = require('msgpack5')();

const url = 'https://' + cfg.host + ':' + cfg.port;

const commandsOptions = (loginInfo, deviceId, rawData) => {
  if (cfg.mode == 'platform') {
    return {
      method: 'POST',
      url: url + '/iocm/app/cmd/v1.4.0/deviceCommands?appId=' + cfg.appId,
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
            rawData: rawData
          }
        },
        expireTime: 0
      },
      strictSSL: false,
      json: true
    };
  } else {
    return {
      method: 'POST',
      url: url + '/api/v3.0/devices/' + deviceId + '/commands',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'ownerAppId': cfg.appId
      },
      body: {
        serviceId: 'RawData',
        method: 'CMD',
        body: {
          rawData: rawData
        },
        expireTime: 0
      },
      strictSSL: false,
      json: true
    };
  }
};

// fetch accessToken when longin, and update before timeout
exports.deviceCommands = (loginInfo, deivceId, data) => {
  return new Promise((resolve, reject) => {
    var rawData;
    switch (cfg.encode) {
      case 'base64':
        if (typeof data == 'object') {
          rawData = Buffer.from(JSON.stringify(data)).toString('base64');
        } else {
          rawData = Buffer.from(data).toString('base64');
        }
        break;

      case 'msgpack':
        rawData = msgpack.encode(data).toString('base64');
        break;

      default:
        break;
    }
    request(commandsOptions(loginInfo, deivceId, rawData), (err, res, body) => {
      console.log(body);
      if (res.statusCode === 201) {
        resolve();
      }
    });
  });
};