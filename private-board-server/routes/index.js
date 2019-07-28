var express = require('express');
var LevelDB = require('../utils/level');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/search/:pre", function(req, res){
  var option = {prefix: req.params.pre};
  var dataList = {};
  LevelDB.find(option, function(key, value){
    if (key != null) {
      try {
        dataList[key] = JSON.parse(value);
      } catch(err) {
        dataList[key] = value;
      }
    } else {
      console.log(value);
      res.end(JSON.stringify(dataList));
    }
  });
});

module.exports = router;
