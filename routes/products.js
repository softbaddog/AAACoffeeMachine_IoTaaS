const express = require('express');
const router = express.Router();
const _ = require('underscore');
const Product = require('../models/product');
const auth = require('../iotplatform/auth');
const pm = require('../iotplatform/pm');
const cfg = require('../iotplatform/config');

/* GET products listing. */
router.get('/', function (req, res, next) {
  if (cfg.mode == 'basic') {
    let pageNo = parseInt(req.query.pageNo) || 0;
    let pageSize = parseInt(req.query.pageSize) || 10;
    pm.getProducts(auth.loginInfo, pageNo, pageSize)
      .then(data => {
        res.render('product', {
          title: 'Smoke Sensors',
          desc: 'Product Page',
          user: req.user,
          totalCount: data.totalCount,
          products: data.products
        });
        // delete all products
        Product.deleteMany({}, function (err) {});
        for (var product of data.products) {
          Product.create(product);
        }
      });
  } else {
    Product.find({}, function (err, docs) {
      res.render('product', {
        title: 'Smoke Sensors',
        desc: 'Product Page',
        user: req.user,
        totalCount: docs.length,
        products: docs
      });
    });
  }
});

router.get('/new', function (req, res, next) {
    res.render('new', {
      title: 'NOS Cafe Admin',
      desc: 'Add a new Product',
      user: req.user,
      product: {
        deviceType: '',
        manufacturerId: '',
        manufacturerName: '',
        model: '',
        protocolType: ''
      }
    });
});

router.post('/new', function (req, res, next) {
  var id = req.body.product._id;
  var productObj = req.body.product;
  var _product;
  console.log(productObj);
  if (id !== '') {
    Product.findById(id, function (err, product) {
      if (err) {
        console.log(err);
      }

      _product = _.extend(product, productObj);
      _product.save(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/admin/list');
        }
      });
    });
  } else {
    _product = new Product({
      manufacturerId: productObj.manufacturerId,
      manufacturerName: productObj.manufacturerName,
      deviceType: productObj.deviceType,
      model: productObj.model,
      protocolType: productObj.protocolType
    });
    _product.save(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/products');
      }
    });
  }
});

router.get('/delete/:id', function (req, res, next) {
  Product.findByIdAndRemove(req.params.id, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
       res.redirect('/');
    }
  });
});

module.exports = router;