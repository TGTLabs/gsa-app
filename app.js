'use strict';

var dotenv = require('dotenv');
dotenv.load();

var thisPackage = require('./package');
var express = require('express');
var morgan = require('morgan');
var compress = require('compression');
var path = require('path');
var exphbs = require('express-handlebars');
var request = require('superagent');
var _ = require('lodash');
var pollManager = require('./lib/pollManager');

var app = express();
app.set('title', thisPackage.description);

var loggingFormat =
  'remote=:remote-addr ":method :url HTTP/:http-version" status=:status length=:res[content-length] responseTime=:response-time request_id=:req[X-Request-ID] referrer=":referrer" userAgent=":user-agent"';
app.use(morgan(loggingFormat));
app.use(compress());

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'polar')));

app.get('/', function (req, res) {
  pollManager.getting()
    .then(function (polarData) {
      res.render('landing', {
        polls: polarData
      });
    });
});

app.get('/404', function (req, res) {
  pollManager.getting()
    .then(function (polarData) {
      res.render('404', {
        polls: polarData
      });
    });
});

app.get('/:id', function (req, res) {
  pollManager.getting()
    .then(function (polarData) {
      if (polarData[req.params.id]) {
        res.render('index', {
          id: req.params.id,
          set: polarData[req.params.id].set
        });
      } else {
        res.redirect('/404');
      }
    });
});

app.get('/polar/:id', function (req, res) {
  pollManager.getting()
    .then(function (polarData) {
      if (polarData[req.params.id]) {
        res.render('polar', {
          id: req.params.id,
          set: polarData[req.params.id].set
        });
      } else {
        res.redirect('/404');
      }
    });
});

app.use(function (req, res) {
  res.redirect('/404');
});

var port = process.env.PORT || 5000 || 9000;
app.listen(port, function () {
  console.log("%s, version %s. Listening on %s", app.get('title'),
    thisPackage.version, port);
});
