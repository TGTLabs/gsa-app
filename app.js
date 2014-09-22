'use strict';

var dotenv = require('dotenv');
dotenv.load();

var thisPackage = require('./package');
var express = require('express');
var morgan = require('morgan');
var compress = require('compression');
var path = require('path');
var exphbs  = require('express-handlebars');
var request = require('request');

var app = express();
app.set('title', thisPackage.description);

var loggingFormat = 'remote=:remote-addr ":method :url HTTP/:http-version" status=:status length=:res[content-length] responseTime=:response-time request_id=:req[X-Request-ID] referrer=":referrer" userAgent=":user-agent"';
app.use(morgan(loggingFormat));
app.use(compress());

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'polar')));

app.get('/:id', function (req, res) {
  res.render('index', { id: req.params.id});
});

app.get('/set/:id', function (req, res) {
  res.render('index', { id: req.params.id, set: true});
});

app.get('/polar/:id', function (req, res) {
  res.render('polar', { id: req.params.id});
});

app.get('/polar/set/:id', function (req, res) {
  res.render('polar-set', { id: req.params.id, set: true});
});

app.use(function(req, res, next){
  // res.render('404', { status: 404, url: req.url });
  request('https://polarb.com/api/v4/users/nicolenetland/polls_created?limit=50', function (error, response, body) {
  var pollSummary = {};
  if (!error && response.statusCode == 200) {
  var bodyParsed = JSON.parse(body);
  console.log(bodyParsed);
  res.render('404', { res: bodyParsed});
  }
  });
});



var port = process.env.PORT || 5000 || 9000;
app.listen(port, function () {
  console.log("%s, version %s. Listening on %s", app.get('title'), thisPackage.version, port);
});
