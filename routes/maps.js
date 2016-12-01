var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/maps');

var Map = mongoose.model('Map', {
  data: Array
});

// hacky init script
// findOneAndSave didn't seem to work with empty collections
Map.find({}, function(err, doc) {
  if (err || (doc && doc.length == 0)) {
    var dummyMap = new Map({
      data: []
    });
    dummyMap.save(function() {
      console.log('DB initialized');
    });
  }
});

router.get('/', function(req, res) {
  Map.find({}, function(err, doc) {
    if (err) {
      res.send(500, {
        error: err
      });
    }
    res.send(doc);
  })
});

router.put('/', function(req, res) {
  var query = {
    '_id': req.body._id
  };
  console.log(req.body);
  Map.findOneAndUpdate({}, req.body, function(err, doc) {
    if (err) {
      res.send(500, {
        error: err
      });
    }
    res.send({
      msg: "succesfully saved",
      data: doc // returns previous data, not new data
    });
  });
});

module.exports = router;
