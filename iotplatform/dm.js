var request = require('request');
var config = require('./conf');

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
      url: 'https://' + config.host + ':' + config.port + '/iocm/app/reg/v1.2.0/devices',
      cert: config.cert,
      key: config.key,
      headers: {
        'app_key': config.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': config.appId
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
      url: 'https://' + config.host + ':' + config.port + '/iocm/app/dm/v1.1.0/devices/' + deviceId,
      cert: config.cert,
      key: config.key,
      headers: {
        'app_key': config.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': config.appId
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
      url: 'https://' + config.host + ':' + config.port + '/iocm/app/dm/v1.2.0/devices/' + deviceId,
      cert: config.cert,
      key: config.key,
      headers: {
        'app_key': config.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      qs: {
        'appId': config.appId
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
      url: 'https://' + config.host + ':' + config.port + '/iocm/app/data/v1.1.0/deviceDataHistory',
      cert: config.cert,
      key: config.key,
      headers: {
        'app_key': config.appId,
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