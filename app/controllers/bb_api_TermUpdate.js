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

var BgGreen = "\x1b[42m";




var OauthToken;
// Contains:
// OauthToken.expires_in
// OauthToken.access_token
var expire_time;


//sets random timeout for calling api, google has rate limiting stuff
// changeme to exponetial backoff
function invokeLater(err, method,arg1) {
  var rand = Math.round(Math.random() * 5000);
  console.log('The API returned an error: ' + err + ' - retrying in ' + rand + 'ms');
  setTimeout(function () {
    method(arg1);
  }, rand);
}

function callBB_API(callback, op1) {
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
        if (callback) {
          return callback(OauthToken.access_token, op1);
        }

      }

    });
  }
  else {
    console.log("Got Access Token:", OauthToken.access_token);
    if (callback) {
      return callback(OauthToken.access_token, op1);
    }
  }

}


///////////////////////////////////

function updateCourse(auth2, paramsPayload) {
  var thisUrl = 'https://bb.nsuok.edu/learn/api/public/v1/courses/externalId:' + paramsPayload.courseId;
  var dateNow = new Date();
  if ((expire_time < dateNow)) {
    callBB_API(auth2 = function (newAuth) {
      auth2 = newAuth;
      console.log('Token Expired getting new one');
    });
    console.log('new token: ' + auth2);
  }
  var params = {
    url: thisUrl,
    method: 'PATCH',
    auth: {
      bearer: auth2
    },
    body: paramsPayload.payload,
    json: true
  };

  request(params, function (err, res) {
    if (err) {
      console.log(" ERROR ERROR error in : " + err);
    }
    console.log("Updated: CourseID: " + paramsPayload.courseId);
    if (res.statusCode != 200) {
      console.error("HTTP error code: " + res.statusCode);
      var jsonError =  res.toJSON();
      var error = "HTTP error code: " + res.statusCode + " " + JSON.stringify(jsonError);
      //invokeLater()
      console.error(error);

      if (res.body) {
        var json = JSON.stringify(res.body);
        console.log("response: " + json);
      }
      else {
        console.error("No body in response" + JSON.stringify(res));
      }
    }
    else {
      console.log(BgGreen, "HTTP status code: " + res.statusCode);
      var json = JSON.stringify(res.body);
      console.time("response: " + json);
    }


    // if (json.paging) {
    //   getPageOfObjects(auth2, json.paging.nextPage);
    // }
  });

}

// function storeDocument(doc) {
//   bucket.manager().createPrimaryIndex(function () {
//     bucket.insert(doc.externalId, doc, function (err, result) {
//       if (!err) {
//         console.log("stored document successfully. CAS is %j", result.cas);
//       }
//       else {
//         console.error("Couldn't store document: %j", err);
//       }
//     });
//   });


// }


module.exports = {
  update: function () {
    var payloadUpdateDuration = {
      "availability": {
        "duration": {
          "type": "Term"
        }
      }
    };



    callBB_API();
    // ...
    var query = N1qlQuery.fromString('select courseId from default where availability.duration.type != "Term"');
    bucket.query(query, function (err, rows, meta) {
      for (var row in rows) {
        var options = {
          //courseId: "2017-20218",
          payload: payloadUpdateDuration
        };
        options.courseId = rows[row].courseId;
        //callBB_API(updateCourse, options)
        var time = row * 1000;
        setTimeout(callBB_API, time, updateCourse, options);

        console.log('updating: ', options.courseId);
      }
    });


  }
};