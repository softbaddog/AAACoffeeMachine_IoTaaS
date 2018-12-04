var request = require('request');
var cfg = require('./config');

var deviceInfo = {
  manufacturerId: 'HuaweiDemoID',
  manufacturerName: 'HuaweiDemo',
  deviceType: 'Base64Demo',
  model: 'Base64',
  protocolType: 'CoAP'
};

// register a device
exports.registerDevice = (loginInfo, nodeId) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/reg/v1.2.0/devices',
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
        'verifyCode': nodeId,
        'nodeId': nodeId,
        'timeout': 0
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resolve(body.deviceId);
      } else {
        reject({
          statusCode: res.statusCode,
          statusText: res.statusText
        });
      }
    });
  });
};

// delete a device
exports.deleteDevice = (loginInfo, deviceId) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'DELETE',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/dm/v1.1.0/devices/' + deviceId,
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': cfg.appId
      },
      strictSSL: false,
      json: true
    };
    request(options, (error, res, body) => {
      if (!error && res.statusCode === 204) {
        resolve({
          result: true
        });
      } else {
        console.log(body);
        reject({
          statusCode: res.statusCode,
          statusText: res.statusText
        });
      }
    });
  });
};

// Update a device
exports.updateDevice = (loginInfo, deviceId, deviceName) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: 'PUT',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/dm/v1.2.0/devices/' + deviceId,
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
        name: deviceName,
        manufacturerId: deviceInfo.manufacturerId,
        manufacturerName: deviceInfo.manufacturerName,
        deviceType: deviceInfo.deviceType,
        model: deviceInfo.model,
        protocolType: deviceInfo.protocolType
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      if (!err) {
        resolve({
          deviceInfo: {
            deviceId: deviceId,
            deviceName: deviceName
          }
        });
      } else {
        reject({
          statusCode: res.statusCode,
          statusText: res.statusText
        });
      }
    });
  });
};

// Get data history
exports.getDataHistorty = (loginInfo, deviceId, pageNo, pageSize) => {
  return new Promise((resovle, reject) => {
    var options = {
      method: 'GET',
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/data/v1.1.0/deviceDataHistory',
      cert: cfg.cert,
      key: cfg.key,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'deviceId': deviceId,
        'gatewayId': deviceId,
        'pageNo': pageNo,
        'pageSize': pageSize
      },
      strictSSL: false,
      json: true
    };
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resovle({
          result: true,
          totalCount: body.totalCount,
          dataHistorty: body.deviceDataHistoryDTOs
        });
      } else {
        reject({
          statusCode: res.statusCode,
          statusText: res.statusText
        });
      }
    });
  });
};