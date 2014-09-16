"use strict";

var dotenv = require('dotenv');
dotenv.load();

var thisPackage = require('./package');
var express = require('express');
var morgan = require('morgan');
var compress = require('compression');
var path = require('path');

var app = express();
app.set('title', thisPackage.description);

var loggingFormat = 'remote=:remote-addr ":method :url HTTP/:http-version" status=:status length=:res[content-length] responseTime=:response-time request_id=:req[X-Request-ID] referrer=":referrer" userAgent=":user-agent"';
app.use(morgan(loggingFormat));
app.use(compress());

app.engine('jade', require('jade').__express);
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');

app.get('/w/:id', function (req, res) {
  res.render('wedgies', { id: req.params.id});
});

app.get('/p/set/:id', function (req, res) {
  res.render('polar', { pollSet: true, id: req.params.id});
});

app.get('/p/:id', function (req, res) {
  res.render('polar', { id: req.params.id});
});

var port = process.env.PORT || 5000 || 9000;
app.listen(port, function () {
  console.log("%s, version %s. Listening on %s", app.get('title'), thisPackage.version, port);
});