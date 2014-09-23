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

app.get('/', function(req, res) {
  request
    .get('https://polarb.com/api/v4/publishers/TargetUXR/poll_sets')
    .accept('application/json')
    .end(function(pollSets) {
      var sortedPollId = _.sortBy(
        _.intersection(
          _.flatten(
            _.pluck(pollSets.body, 'poll_ids')
          )
        )
      );

      var pollsToRender = [];

      request
        .get('https://polarb.com/api/v4/users/TargetUXR/polls_created')
        .query({
          limit: 50
        })
        .end(function(polls) {
          polls.body.forEach(function(poll) {
            if (_.indexOf(sortedPollId, poll.pollID, true) < 0) {

              // add the poll to be rendered
              pollsToRender.push({
                id: poll.pollID,
                caption: poll.caption
              });
            }
          });
          res.render('landing', {
            sets: pollSets.body,
            polls: pollsToRender
          });
        });
    });
});

app.get('/:id', function(req, res) {
  request
    .get('https://polarb.com/api/v4/polls/' + req.params.id)
    .accept('application/json')
    .end(function(pollData) {
      if (pollData.body.hasOwnProperty('creator') && pollData.body.creator.hasOwnProperty(
        'username') && pollData.body.creator.username == "TargetUXR") {
        res.render('index', {
          id: req.params.id
        });
      } else {
        res.redirect('/');
      }
    });

});

app.get('/set/:id', function(req, res) {
  //validate set id is good
  res.render('index', {
    id: req.params.id,
    set: true
  });
});

app.get('/polar/:id', function(req, res) {
  res.render('polar', {
    id: req.params.id
  });
});

app.get('/polar/set/:id', function(req, res) {
  res.render('polar', {
    id: req.params.id,
    set: true
  });
});



app.use(function(req, res, next) {
  request
    .get('https://polarb.com/api/v4/publishers/TargetUXR/poll_sets')
    .accept('application/json')
    .end(function(pollSets) {
      var sortedPollId = _.sortBy(
        _.intersection(
          _.flatten(
            _.pluck(pollSets.body, 'poll_ids')
          )
        )
      );

      var pollsToRender = [];

      request
        .get('https://polarb.com/api/v4/users/TargetUXR/polls_created')
        .query({
          limit: 50
        })
        .end(function(polls) {
          polls.body.forEach(function(poll) {
            if (_.indexOf(sortedPollId, poll.pollID, true) < 0) {

              // add the poll to be rendered
              pollsToRender.push({
                id: poll.pollID,
                caption: poll.caption
              });
            }
          });
          res.render('404', {
            sets: pollSets.body,
            polls: pollsToRender
          });
        });
    });
});


var port = process.env.PORT || 5000 || 9000;
app.listen(port, function() {
  console.log("%s, version %s. Listening on %s", app.get('title'),
    thisPackage.version, port);
});
