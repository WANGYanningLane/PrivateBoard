var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:bid', function(req, res, next) {
  res.render('board', { title: req.params.bid });
});

module.exports = router;
