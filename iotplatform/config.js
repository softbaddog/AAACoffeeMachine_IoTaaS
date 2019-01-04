var fs = require('fs');
var path = require('path');

// IoT Cloud（Hub）
// module.exports = {
// 	mode: 'hub', // hub,platform
// 	host: 'iot-api.huaweicloud.com', //49.4.80.153
// 	port: '8743',
// 	appId: '24orO65NQn1cwxl8LPJ5fkCm14Aa',
// 	secret: 'UqJDu50cJBA1IXsQKy7iUwmphu8a',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key'))
// };

//IoT Cloud（Developer）
module.exports = {
	mode: 'platform', // hub,platform
	encode: 'msgpack',  // base64, msgpack, default
	host: '49.4.92.191',
	port: '8743',
	appId: 'CNsJCMgvnNitKOq5FSiy994hHYIa',
	secret: 'hdB2HJ3oL3eqIUPXQylIPSCppHoa',
	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key')),
	// callback_url: 'https://softbaddog.oicp.vip:443/device/callback'
	callback_url: 'http://softbaddog.oicp.net:13899/device/callback'
};

// IoT Cloud (European Hosting Center)
// module.exports = {
// 	mode: 'platform', // hub,platform
// 	encode: 'base64',  // base64, msgpack, default
// 	host: '160.44.197.248',
// 	port: '8743',
// 	appId: 'cHxwfUtRCxg8x8j8W4wApQ_mOZka',
// 	secret: 'dEZQ0QIQzyTjB49aRuBrcNyfXcsa',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/plt-app-gw.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/plt-app-gw.key')),
// 	callback_url: 'http://178.15.147.143:3000/device/callback'
// 	// callback_url: 'http://softbaddog.oicp.net:13899/device/callback'
// };

// OpenLab
// module.exports = {
// 	mode: 'platform', // hub,platform
// 	encode: 'msgpack',  // base64, msgpack, default
// 	host: '139.159.133.59',
// 	port: '8743',
// 	appId: 'nqwYk8QHVVHfRph5bQwUWy1SCDoa',
// 	secret: 'kYooQ7IQbWhf1alhyFX3BuDaRpwa',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key')),
// 	//callback_url: 'https://softbaddog.oicp.vip:443/device/callback'
// 	//callback_url: 'http://softbaddog.oicp.net:13899/device/callback'
// 	callback_url: 'http://178.15.147.143:3000/device/callback'
// };


// CHINA TELECOM
// module.exports = {
// 	mode: 'platform', // hub,platform
// 	host: '180.101.147.89',
// 	port: '8743',
// 	appId: 'mw4CH118eXWOKN2defaFvuSx0QIa',
// 	secret: 'L5KJ3BAY25th67LKDUhEM3KwRU4a',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key')),
// 	// callback_url: 'http://178.15.147.143:3000/devices/callback'
// 	callback_url: 'http://softbaddog.oicp.net:13899/device/callback'
// };
