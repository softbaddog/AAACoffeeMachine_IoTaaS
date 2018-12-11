var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/list', function (req, res, next) {
  res.render('list.pug', {
    title: "Admin List"
  });
});

router.get('/device', function (req, res, next) {
  res.render('admin.pug', {
    title: "Admin device"
  });
});

module.exports = router;