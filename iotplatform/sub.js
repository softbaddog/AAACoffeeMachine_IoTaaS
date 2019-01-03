var request = require('request');
var cfg = require('./config');

exports.notifyTypeList = [{
  notifyType: 'deviceAdded',
  enabled: true
}, {
  notifyType: 'deviceInfoChanged',
  enabled: true
}, {
  notifyType: 'deviceDataChanged',
  enabled: true
}, {
  notifyType: 'deviceDeleted',
  enabled: true
}, {
  notifyType: 'deviceEvent',
  enabled: false
}, {
  notifyType: 'messageConfirm',
  enabled: false
}, {
  notifyType: 'commandRsp',
  enabled: false
}, {
  notifyType: 'serviceInfoChanged',
  enabled: false
}, {
  notifyType: 'ruleEvent',
  enabled: false
}, {
  notifyType: 'bindDevice',
  enabled: false
}, {
  notifyType: 'deviceDatasChanged',
  enabled: false
}];

exports.subscribe = (loginInfo, notifyType) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "POST",
      url: 'https://' + cfg.host + ':' + cfg.port + '/iocm/app/sub/v1.1.0/subscribe',
      cert: cfg.cert,
      key: cfg.key,
      strictSSL: false,
      json: true,
      headers: {
        'app_key': cfg.appId,
        'Authorization': loginInfo.tokenType + ' ' + loginInfo.accessToken
      },
      body: {
        notifyType: notifyType,
        callbackurl: cfg.callback_url
      }
    };

    request(options, (error, response, body) => {
      if (!error && response.statusCode === 201) {
        console.log("sub '" + notifyType + "' ok");
      } else {
        console.log(body);
      }
    });
  });
};