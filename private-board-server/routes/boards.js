var Board = require('../models/board');
var History = require('../models/history');
var LevelDB = require('../utils/level');
var Crypto = require('../utils/crypto');
var express = require('express');
var router = express.Router();

//page
/*router.get('/:bid', function(req, res, next) {
  res.render('board', { title: req.params.bid });
});*/

//page
/*router.get('/create', function(req, res, next) {
  res.render('board', { title: "创建板报"});
})*/

//api
router.get('/info/:bid', function(req, res) {
  var id = req.params.bid;
  var boardKey = "bid:" + id;
  LevelDB.get(boardKey, function(error, data) {
    if(error) {
      res.end(error.message);
    } else {
      if (data) {
        res.end(data);
      }
    }
  });
})

//api: create board
router.post('/info/create', function(req, res) { 
  var data = req.body;
  console.log("Create DATA: " + JSON.stringify(data));
  if (data == null) {
    res.end('Body Empty');
    return;
  }
  var name = data.name;
  var id = data.id;
  var pubKey = data.pubKey;
  if (!name || !id || !pubKey) {
    res.end('Missing field');
    return;
  }
  var hash = Crypto.sha256(pubKey);
  if (hash != id) {
    res.end('Invalid Board Id');
    return;
  }
  var boardKey = "bid:" + id;
  if (false) {
    LevelDB.get(boardKey, function(error, value){
      if (error) {
      } else{
        res.end('Board has existed!')
      }
    })
  }
  //add boardInfo to levelDB
  var board = new Board();
  board.name = name;
  board.id = id;
  board.pubKey = pubKey; 
  board.updated_at = Date.now();
  board.log = "hid:" + id + ":genesis";
  //build name-board map in levelDB
  var nameKey = "bname:" + name;
  LevelDB.batch([{
    type: 'put',
    key: boardKey,
    value: JSON.stringify(board)
  }, {
    type: 'put',
    key: nameKey,
    value: boardKey
  }], function(error, batchList) {
    if (error) {
      res.end("Create Board Fail", error.message);
    } else {
      res.end("Create Board:" + id);
    }
  })
})

//api: update board memos
router.post('/info/update', function(req, res) {
  var data = req.body;
  console.log("Update DATA: " + data);
  var id = data.id;
  var content = data.content;
  var timestamp = data.timestamp;
  var boardKey = "bid:" + id;
  LevelDB.get(boardKey, function(error, value) {
    if (error) {
      res.end("Update Failed: " + error);
      return;
    }
    var board = JSON.parse(value);
    if (timestamp < board.updated_at) {
      res.end("Update Failed: not latest version");
      return;
    } else {
      var history = new History();
      history.id = id + ":" + timestamp;
      var prevHash = board.log;
      history.prevHash = prevHash;
      history.content = content;
      history.timestamp = timestamp;
      var historyKey = "hid:" + history.id + ":" + Crypto.sha256(JSON.stringify(history));
      board.memos = content;
      board.updated_at = timestamp;
      board.log = historyKey;
      LevelDB.batch([{
        type: 'put',
        key: boardKey,
        value: JSON.stringify(board)
      },{
        type: 'put',
        key: historyKey,
        value: JSON.stringify(history)
      }], function(error, batchList){
        if (error) {
          res.end("Update Memo Failed: " + error.message);
        } else {
          res.end('Update Success, Last Updated: ' + timestamp)
        }
      })
    }
  });
})

module.exports = router;
