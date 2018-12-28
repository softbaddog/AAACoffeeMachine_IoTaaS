const express = require('express');
const router = express.Router();

const Product = require('../models/product');
const Device = require('../models/device');

const cfg = require('../iotplatform/config');
const auth = require('../iotplatform/auth');
const dm = require('../iotplatform/dm');



module.exports = router;