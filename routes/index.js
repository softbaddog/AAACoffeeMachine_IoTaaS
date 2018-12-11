var express = require('express');
var router = express.Router();

/* GET device listing. */
router.get('/', function (req, res, next) {
  res.redirect('/devices');
});

module.exports = router;