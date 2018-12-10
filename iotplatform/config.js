var fs = require('fs');
var path = require('path');

module.exports = {
	host: '139.159.133.59',
	port: '8743',
	appId: 'nqwYk8QHVVHfRph5bQwUWy1SCDoa',
	secret: 'kYooQ7IQbWhf1alhyFX3BuDaRpwa',
	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/client.crt')),
	key: fs.readFileSync(path.resolve(__dirname, 'ssl/client.key')),
	// callback_url: 'https://softbaddog.oicp.vip:443/devices/callback'
	callback_url: 'http://softbaddog.oicp.net:13899/devices/callback'
};

// module.exports = {
// 	host: '160.44.197.248',
// 	port: '8743',
// 	appId: 'cHxwfUtRCxg8x8j8W4wApQ_mOZka',
// 	secret: 'dEZQ0QIQzyTjB49aRuBrcNyfXcsa',
// 	cert: fs.readFileSync(path.resolve(__dirname, 'ssl/plt-app-gw.crt')),
// 	key: fs.readFileSync(path.resolve(__dirname, 'ssl/plt-app-gw.key')),
// 	callback_url: 'http://softbaddog.oicp.net:13899/devices/callback'
// };
