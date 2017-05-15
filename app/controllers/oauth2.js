/**
 * This is used by several processes
 * oauth2 workflow.
 */

// var secrets = config.googleConfig;
// var stored_token_path = config.googleConfig.token_path;
// var stored_token_dir = config.googleConfig.token_dir;
var request = require('request');


function OAuth2Client() {
  var OauthToken;
  // Contains:
  // OauthToken.expires_in
  // OauthToken.access_token
  var expire_time;

  if (!(expire_time > Date.now())) {
    var self = this;
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
      console.log("Got Access Token:", json.access_token);
      OauthToken = json;
      if (OauthToken.expires_in) {
        var dateNow = new Date();
        expire_time = new Date(dateNow.getTime() - OauthToken.expires_in * 1000);
        console.log('token Expire time is:' + expire_time);
      }
    });
  }

  return self;
}

function GoogleOAuth2Client(options) {
  var self = this;
  self.isAuthenticated = false;
  this._options = options || { scopes: [] };

  // create an oAuth client to authorize the API call
  this.oAuth2Client = new OAuth2Client(
    secrets.client_id,
    secrets.client_secret,
    secrets.redirect_uris[0]
  );

  // Open an http server to accept the oauth callback. In this
  this._authenticate = function (scopes, callback) {
    // grab the url that will be used for authorization
    self.authorizeUrl = self.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
      approval_prompt: 'force'
    });
    var server = http.createServer(function (request, response) {
      callOnce(function () {
        handler.call(self, request, response, server, callback);
      });
    }).listen(config.googleConfig.port, function () {
      // open the browser to the authorize url to start the workflow
      console.log("Open this url to authorize Google APIs: " + self.authorizeUrl);
      //spawn('start', [self.authorizeUrl]); // this would open the browser, did not work on windows
    });
  };

  self.execute = function (scopes, callback) {
    self._callback = callback;
    if (self.isAuthenticated) {
      callback.apply();
    } 
    else {
      // Check if we have previously stored a token.
      fs.readFile(stored_token_path, function (err, token) {
        if (err) {
          self._authenticate(scopes, callback);
        } else {
            self.oAuth2Client.credentials = JSON.parse(token);
            //self.oAuth2Client.setCredentials(JSON.parse(token));
            self.isAuthenticated = true;
            console.log('Authenticated to Google APIs using stored token');
            callback.apply();
          }
      });
      
    }
  };

  return self;
}

module.exports = new OAuth2Client();