"use strict";
var request = require("superagent");
var _ = require('lodash');
var Q = require('q');

var publisher = 'TargetUXR';
var polarAPI_base = 'https://polarb.com/api/v4';

/*
 {
 '4897' : { 'name' : 'somePollSet', 'id': '4897', 'set': true, 'poll_ids' : [23144]},
 '23142' : { 'name' : 'somePoll', 'id': '23142', 'closed': true},
 '23144' : { 'name' : 'somePoll', 'id': '23144', 'inset' : true}
 }
 */
var getting = function () {
  return gettingPolarAPI_pollSets()
    .then(function (pollSets) {
      var polarData = {};
      pollSets.forEach(function (pollSet) {
        polarData[pollSet.id] = { name: pollSet.name, id: pollSet.id, set: true, closed: pollSet.deleted, poll_ids: pollSet.poll_ids };
      });

      return polarData;
    })
    .then(function (polarData) {
      var sortedPollId = _.sortBy(
        _.intersection (
          _.flatten(
            _.pluck(polarData, 'poll_ids')
          )
        )
      );

      return gettingPolarAPI_polls()
        .then(function(polls) {
          polls.forEach( function (poll) {
            polarData[poll.pollID] = { name: poll.caption, id: poll.pollID, set: false, closed: poll.closed, inset: _.indexOf(sortedPollId, poll.pollID, true) >= 0};
          });

          return polarData;
        });
    });
};

var gettingPolarAPI_pollSets = function () {
  var deferred = Q.defer();

  request
    .get(polarAPI_base + '/publishers/' + publisher + '/poll_sets')
    .accept('application/json')
    .end(function (err, response) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(response.body);
      }
    });

  return deferred.promise;
};

var gettingPolarAPI_polls = function () {
  var deferred = Q.defer();

  request
    .get(polarAPI_base + '/users/' + publisher + '/polls_created')
    .accept('application/json')
    .query({ limit: 50 })
    .end(function (err, response) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(response.body);
      }
    });

  return deferred.promise;
};

module.exports = {
  getting: getting
};