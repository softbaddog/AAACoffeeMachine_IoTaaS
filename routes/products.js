const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const auth = require('../iotplatform/auth');
const pm = require('../iotplatform/pm');

/* GET products listing. */
router.get('/', function (req, res, next) {
  let pageNo = parseInt(req.query.pageNo) || 0;
  let pageSize = parseInt(req.query.pageSize) || 10;
  pm.getProducts(auth.loginInfo, pageNo, pageSize)
    .then(data => {
      res.render('products', {
        title: 'NOS Cafe',
        desc: 'Product Page',
        totalCount: data.totalCount,
        products: data.products
      });
      // delete all products
      Product.deleteMany({}, function (err) {});
      for (var product of data.products) {
        Product.create(product);
      }
    });
});

module.exports = router;