'use strict';

var google = require('googleapis');
var googleoauth2client = require('./oauth2');
var config = require('../../config/config');
var async = require("async");
// Generate a v4 UUID (random) 
var uuidV4 = require('uuid/v4');
var fs = require('fs');

var auth = googleoauth2client.oAuth2Client;
var scopes = config.googleConfig.scopes;

var admin = google.admin({
  version: 'reports_v1',
  auth: auth
});

function startEventWatch(eventType, cb) {
  var CURRENT_UUID = uuidV4();
  console.log(Date.now() + ` Calling web_hook ${eventType} reports. uuid: ${CURRENT_UUID}`)

  //auth.setCredentials(tokens);

  var data = {
    auth: auth,
    userKey: 'all',
    //singleEvents: true,
    applicationName: eventType,
    //orderBy: 'startTime',
    resource: {
      id: CURRENT_UUID,
      //token: 'email='+_token.provider_email,
      address: config.googleConfig.web_hook_url,
      type: 'web_hook',
      params: {
        ttl: config.googleConfig.ttl
      }
    }
  };
  admin.activities.watch(data, function (err, response) {
    if (err) {
      console.error('The API returned an error: ' + JSON.stringify(err));
      cb(err);
      //return;
    }
    else {
      cb();
      console.log(Date.now() + ` now watching for ${eventType}: ${JSON.stringify(response)}`);
    }
  });
}

module.exports = {
  watch: function (options) {
    googleoauth2client.execute(scopes,
      function (tokens) {
        async.each(options, startEventWatch, function (err) {
          if (err) {
            console.log("async calling watchers returned an error: " + err);
          }
          else {
            console.log("Called all Google API push notification webhook requests!");
          }
        });
        // console.log("calling watch.");
        // startEventWatch(options, tokens);
      });
  }
};

//module.exports = new googleReportsWatch();