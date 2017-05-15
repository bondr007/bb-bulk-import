'use strict';

var google = require('googleapis');
var googleoauth2client = require('./oauth2');
var config = require('../../config/config');
var async = require("async");
var mongoose = require('mongoose');
var Event = require('../models/event');


var auth = googleoauth2client.oAuth2Client;
var scopes = config.googleConfig.scopes;
var pollingTimeGreater = config.googleConfig.polling_full_sync_time;

var admin = google.admin({
  version: 'reports_v1',
  auth: auth
});

//sets random timeout for calling api, google has rate limiting stuff
// changeme to exponetial backoff
function invokeLater(err, method) {
  var rand = Math.round(Math.random() * 5000);
  console.log('The API returned an error: ' + err + ' - retrying in ' + rand + 'ms');
  setTimeout(function () {
    method();
  }, rand);
}

function getPageOfEvents(params, nextPageToken) {
  if (nextPageToken)
    params.pageToken = nextPageToken;
  admin.activities.list(params, function (err, response) {
    if (err) {
      invokeLater(err, function () {
        getAndStoreAllEvents(params.applicationName);
      });
      return;
    }
    if (response.items) {
      //saveEventsToMongoDB(response.items);
      Event.collection.insert(response.items, onInsert);
      function onInsert(err, docs) {
        if (err) {
          if (err.code == '11000') {
            console.log("WARN event already processed. Duplicate")
          }
          else {
                   console.log("Error saving event from Polling: " + err);
          }
        }
        else { //If no errors
          console.log(`SAVED ${docs.insertedCount} ${params.applicationName} Events from Polling to DB`);
          //console.info('%d events were successfully stored.', docs.length);
        }
        var insertedIds = docs.insertedIds;
        console.log(`IDS ${insertedIds}`);

      }
    }

    if (response.nextPageToken)
      getPageOfEvents(params, response.nextPageToken);
  });
}

// function saveEvent(doc) {
//   //Creates a new event
//   doc.source = "polling"
//   var newEvent = new Event(doc);
//   //Save it into the DB.
//   //console.log(doc);

//   newEvent.save((err, event) => {
//     event
//     if (err) {
//       if (err.code == '11000') {
//         //       console.log("WARN event already processed. Duplicate")
//       }
//       else {
//         //       console.log("Error saving event from Polling: " + err);
//       }
//     }
//     else { //If no errors
//       //console.log("Event successfully added! from Polling: ");
//     }
//   });

// }

// function saveEventsToMongoDB(pageOfEvents) {
//   async.each(pageOfEvents, saveEvent, function (err) {
//     if (err) {
//       console.log("Error Calling Save polling event " + err);
//     }
//     else { //If no errors
//       Console.log("Sucessfulling called save polling event ");
//     }
//   });
// }

function getAndStoreAllEvents(eventType, cb) {
  //sets start_time to ttl + ttloffset
  var seconds = (config.googleConfig.ttl + config.googleConfig.ttl_offset);
  console.log(config.googleConfig.ttl + config.googleConfig.ttl_offset);
  var dateNow = new Date();
  var start_time = new Date(dateNow.getTime() - seconds * 1000);

  var isodate = start_time.toISOString();
  console.log(`Polling Google ${eventType} from: ${isodate}`);
  var params = {
    auth: auth,
    userKey: 'all',
    applicationName: eventType,
    //maxResults: 10,
    //startTime: isodate
  };

  Event.findOne({}, {}, { sort: { 'InsertedAt': -1 } }, function (err, lastEventinDB) {
    if (err) {
      if (lastEventinDB) {
        //console.log('now is: ' + isodate);
        if (lastEventinDB.insertedAt) {

          //console.log('last Event InsertedAt', lastEventinDB.insertedAt);
          //var hoursSinceLastEventinDB = (start_time - lastEventinDB.insertedAt)
          var hoursSinceLastEventinDB = Math.abs(start_time - lastEventinDB.insertedAt) / 36e5;
          //console.log(hoursSinceLastEventinDB);
          if (!(hoursSinceLastEventinDB > pollingTimeGreater)) {
            params.startTime = isodate;
          }
        }
        else {
          params.startTime = isodate;
        }
      }
      else
        if (err) {
          console.log("Error MongoDB query for last Event InsertedAt. error: " + err);
        }
    }

    getPageOfEvents(params);
    //cb();
  });
}

module.exports = {
  watch: function (options) {
    googleoauth2client.execute(scopes,
      function (tokens) {
        //calls getAndStoreAllEvents with options[eventsTypes]
        async.each(options, getAndStoreAllEvents, function (err) {
          if (err) {
            console.log("Error Polling Google APIs: " + err);
          }
          else { //If no errors
            console.log("COMPLETED Calling Polling Google APIs");
          }
        });
      });
  }
};
