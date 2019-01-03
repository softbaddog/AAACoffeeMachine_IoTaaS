# AAACaffeeMachine_IoTaaS Deploy Manual

## Installation Prepare

Make sure you install these packages on your PC first. Our web app has supported Windows, Mac and Linux, you should install special packages.

- Node.js 10.14.x
- MongoDB 3.6.x

## Checking Your Environment

### Check Node.js Installation
run `node -v` in bash or cmd, if it return `v10.4.2`, it means ok.

### Check MongoDB Installation

run `mongo` in bash or cmd, if you see as follow, it means MongoDB is working.

![MongoDB](/temp/mongo_install.png)

### Update the configuration for OceanConnect

Open the `config.js` file in the iotplatform fold, 

![Configuration](/temp/connect_configuration.png)

You should fill with OceanConnect IP address/hostname, App_Key, App_Secret and so on.

If you connect to OceanConnect(Not IoT Hub), you should rewrite `callback_url` to your web app address. The current ipaddr is our hosting center in European.

## Installation Step

If you first run it, you should `npm install`, install plugins for Web app.

and then `npm start` is running the app.

![Running](/temp/webapp_start.png)

Open the browse, `http://localhost:3000/`, the default port is `3000`.

![Running](/temp/homepage.png)

## RESTful API / Pages

- GET `localhost:3000/`
- GET `localhost:3000/login`
- GET `localhost:3000/register`
- GET `localhost:3000/logout`

- POST/GET `localhost:3000/device`
- PUT/DELETE/GET `localhost:3000/device/#{id}`
- POST `localhost:3000/device/bind`
- POST `localhost:3000/device/unbind`

- POST/GET `localhost:3000/product`
- PUT/DELETE/GET `localhost:3000/product/#{id}`