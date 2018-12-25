var fs = require('fs');
var path = require('path');

// 公有云基础版
module.exports = {
	mode: 'basic', // old, basic, advanced
	host: 'iot-api.huaweicloud.com', //49.4.80.153
	port: '8743',
	appId: 'JiB0VrTtGqGI__XtVnvdoubm_g4a',
	secret: 'MMGcwFibUPmgnUy0mAtk5VRGrvAa',
	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key'))
};

// OpenLab
// module.exports = {
// 	mode: 'advanced', // advanced
// 	host: '139.159.133.59',
// 	port: '8743',
// 	appId: 'nqwYk8QHVVHfRph5bQwUWy1SCDoa',
// 	secret: 'kYooQ7IQbWhf1alhyFX3BuDaRpwa',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key')),
// 	//callback_url: 'https://softbaddog.oicp.vip:443/devices/callback'
// 	callback_url: 'http://softbaddog.oicp.net:13899/devices/callback'
// };

// 欧洲Hosting中心
// module.exports = {
// 	host: '160.44.197.248',
// 	port: '8743',
// 	appId: 'cHxwfUtRCxg8x8j8W4wApQ_mOZka',
// 	secret: 'dEZQ0QIQzyTjB49aRuBrcNyfXcsa',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/plt-app-gw.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/plt-app-gw.key')),
// 	// callback_url: 'http://178.15.147.143:1985/devices/callback'
// 	callback_url: 'http://softbaddog.oicp.net:13899/devices/callback'
// };

// 电信平台
// module.exports = {
// 	host: '180.101.147.89',
// 	port: '8743',
// 	appId: 'mw4CH118eXWOKN2defaFvuSx0QIa',
// 	secret: 'L5KJ3BAY25th67LKDUhEM3KwRU4a',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key')),
// 	callback_url: 'http://178.15.147.143:3000/devices/callback'
// 	// callback_url: 'http://softbaddog.oicp.net:13899/devices/callback'
// };
