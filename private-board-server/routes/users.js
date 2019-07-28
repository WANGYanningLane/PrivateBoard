var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.route('/board/:uid').get((req, res) => {
  User.findById(req.params.uid, function (err, user) {
      if (err) res.send(err);
      res.json(user);
  });
}).delete((req, res) => {
  console.log(req.params.uid)
  User.deleteOne({ _id: req.params.uid }, function (err, user) {
      if (err) res.send(err);
      console.log({"msg": req.params.uid + ' is deleted'});
      User.find(function (err, users) {
          if (err) res.send(err);
          res.json(users);
      });
  });
});

module.exports = router;
