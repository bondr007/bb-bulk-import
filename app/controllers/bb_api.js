'use strict';

var config = require('../../config/config');
var async = require("async");
var mongoose = require('mongoose');
var Event = require('../models/event');
var request = require('request');


var couchbase = require('couchbase')
var cluster = new couchbase.Cluster('couchbase://localhost/');
var bucket = cluster.openBucket('default');
var N1qlQuery = couchbase.N1qlQuery;




var OauthToken;
// Contains:
// OauthToken.expires_in
// OauthToken.access_token
var expire_time;


//sets random timeout for calling api, google has rate limiting stuff
// changeme to exponetial backoff
function invokeLater(err, method) {
  var rand = Math.round(Math.random() * 5000);
  console.log('The API returned an error: ' + err + ' - retrying in ' + rand + 'ms');
  setTimeout(function () {
    method();
  }, rand);
}

function callBB_API(callback) {
  var dateNow = new Date();
  if (!(expire_time > dateNow)) {
    request({
      url: 'https://bb.nsuok.edu/learn/api/public/v1/oauth2/token',
      method: 'POST',
      auth: {
        user: 'db5c6a6b-6820-4be0-85f9-23a688dbac02',
        pass: 'PNi3rl37msZziybykTUSwLK6sNnazRbF'
      },
      form: {
        'grant_type': 'client_credentials'
      }
    }, function (err, res) {
      if (err) {
        console.log("Error getting Oauth2 Token: ", err);
      }
      var json = JSON.parse(res.body);
      OauthToken = json;
      console.log("Got Access Token:", json.access_token);
      OauthToken = json;
      if (OauthToken.expires_in) {

        expire_time = new Date(dateNow.getTime() + OauthToken.expires_in * 1000);
        console.log('expiration in seconds: ' + OauthToken.expires_in);
        console.log('Date Now time is:    ' + dateNow);
        console.log('Date Now time i2:    ' + Date.now());
        console.log('token Expire time is:' + expire_time);
        return callback(OauthToken.access_token);
      }

    });
  }
  else {
    console.log("Got Access Token:", OauthToken.access_token);
    return callback(OauthToken.access_token);
  }

}

function getPageOfObjects(auth2, nextPageToken) {
  var dateNow = new Date();
  if ((expire_time < dateNow)) {
    callBB_API(auth2 = function (newAuth) {
      auth2 = newAuth;
      console.log('Token Expired getting new one');
    });
    console.log('new token: ' + auth2);
  }
  var params = {
    url: 'https://bb.nsuok.edu/learn/api/public/v1/courses',
    method: 'GET',
    auth: {
      bearer: auth2
    },
    form: {
      'limit': 400
    }
  };
  if (nextPageToken) {
    params.url = 'https://bb.nsuok.edu' + nextPageToken
  }
  request(params, function (err, res) {
    if (err) {
      console.log(" ERROR ERROR error in : " + err);
    }
    var json = JSON.parse(res.body);
    //console.log("courses:", JSON.stringify(json.results));

    if (json.results) {

      async.each(json.results, storeDocument, function (err) {
        if (err) {
          console.log("Error Saving docs: " + err);
        }
        else { //If no errors
          console.log("COMPLETED saving docs");
        }
      });


      // //saveEventsToMongoDB(response.items);
      // Event.collection.insert(json.results, onInsert);
      // function onInsert(err, docs) {
      //   if (err) {
      //     if (err.code == '11000') {
      //       console.log("WARN event already processed. Duplicate")
      //     }
      //     else {
      //       //       console.log("Error saving event from Polling: " + err);
      //     }
      //   }
      //   else { //If no errors
      //     console.log(`SAVED ${json.results.length} ${params.url} BB stuff`);
      //     //console.info('%d events were successfully stored.', docs.length);
      //   }
      // }
    }

    if (json.paging) {
      getPageOfObjects(auth2, json.paging.nextPage);
    }
  });

}

function storeDocument(doc) {
  bucket.manager().createPrimaryIndex(function () {
    bucket.insert(doc.externalId, doc, function (err, result) {
      if (!err) {
        console.log("stored document successfully. CAS is %j", result.cas);
      }
      else {
        console.error("Couldn't store document: %j", err);
      }
    });
  });


}


module.exports = {
  get: function (options) {
    var bucketMgr = bucket.manager();
    bucketMgr.flush(function (err, status) {
      if (status) {
        console.log('Bucket flushed');
        //call bb apis
        callBB_API(getPageOfObjects);
      } else {
        console.log('Could not flush bucket: ', err);
      }
    });
  }
};