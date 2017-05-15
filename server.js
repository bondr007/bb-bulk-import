let express = require('express');
let app = express();
const mongoose = require('mongoose');

let morgan = require('morgan');
let bodyParser = require('body-parser');
let event = require('./app/routes/event');
let config = require('./config/config'); //we load the db location from the JSON files

let bbapis = require('./app/controllers/bb_api');
const request = require('request-promise');




//db options
let options = {
	server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
	replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

//db connection
//set Promise provider to bluebird vs mpromise which is deprecated in mongoose
mongoose.Promise = require('bluebird');
mongoose.connect(config.db.uri, options);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

console.log("starting bb-bulk-importer in " + process.env.NODE_ENV);

let bbCourseUpdate = require('./app/controllers/bb_api_TermUpdate');


//bbCourseUpdate.update();
bbapis.get();

// from argos 
//getData();



// //const csvReadStream -- Readable stream for csv source 
// const csv=require('csvtojson')

// csv()
// .fromStream(csvReadStream)
// .on('csv',(csvRow)=>{
//     // csvRow is an array 
// })
// .on('done',(error)=>{

// })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// request.get('https://maps.nsuok.edu/mrr', function (error, response, body) {
//     if(request){
// 		console.log(request);
// 	}
// 	if (!error && response.statusCode == 200) {
//         var csv = body;
// 		console.log('here is csv');
//         // Continue with your processing here.
//     }
// });


// var request = require('request');

// var propertiesObject = { 
// 	report:'ZDBI5PJFFRWL5HFPXGXFIMO3EUIZ2IPVMLSYUSITMR2DRSRX22KSAGNAJ3TV2RTYDT7LUFNVFSD2K',
//  	UserName:'bondr',
// 	Password: ''
//  };

// request({url:'https://maps.nsuok.edu/mrr', qs:propertiesObject}, function(err, response, body) {
//   if(err) { console.log(err); return; }
//   console.log("Get response: " + response.statusCode);
// });

// var csvRequest = {
// 	method: 'GET',
// 	uri: 'https://maps.nsuok.edu/mrr',
// 	qs: {
// 		report: 'ZDBI5PJFFRWL5HFPXGXFIMO3EUIZ2IPVMLSYUSITMR2DRSRX22KSAGNAJ3TV2RTYDT7LUFNVFSD2K'
// 	},
// 	headers: {
// 		Origin: 'http://my_url',
// 		"X-Requested-With": 'XMLHttpRequest',
// 		Referer: 'http://asdf.com'
// 	},
// };


// request(csvRequest)
// 	.then(function (response) {
// 		// Handle the response
// 		console.log(response.body);
// 	})
// 	.catch(function (err) {
// 		// Deal with the error
// 		console.log(err);
// 	});
var btoa = require('btoa')
// Build a basic authentication string
function buildBasicAuth(username, password) {
	var tok = username + ':' + password;
	var hash = btoa(tok);
	return "Basic " + hash;
}

// Get the data
function getData() {

	var inputs = "[]";

	var params = {
		path: 'ITS.EnterpirseSystems.BB.BB-CourseSection-Bulk',
		mode: "exec",
		inputs: JSON.stringify(inputs)
	};
	// if (config.maxRecordCount && config.maxRecordCount > 0)
	// 	params.maxRecords = config.maxRecordCount;

	var url = config.baseUrl + 'mw/Argos/DataBlock.Run?' + params;


	var csvRequest = {
		method: 'GET',
		uri: 'https://maps-test.nsuok.edu/mw/Argos/DataBlock.Run',
		qs: params,
		headers: {
			'Authorization': buildBasicAuth('bondr', 'rofl56U9')
		},
		json: true
	};

	// var map = {

	// 	item: {
	// 		externalId: 'rows.0.0',
	// 		courseId: "rows.0.1",
	// 		name: "rows.0.2",
	// 		description: "rows.0.3"
	// 	},
	// 	// operate: [
	// 	// 	{
	// 	// 		run: "Date.parse", on: "date"
	// 	// 	},
	// 	// 	{
	// 	// 		run: function (val) { return val + " more info" }, on: "info"
	// 	// 	}
	// 	// ],
	// 	each: function (item) {
	// 		// make changes 
	// 		item.iterated = true;
	// 		return item;
	// 	}
	// };

	request(csvRequest)
		.then(function (response) {
			// Handle the response
			var data = response;
			//console.log(response.body);

			// var DataTransform = require("node-json-transform").DataTransform;
			// var dataTransform = new DataTransform(data, map);
			// var result = dataTransform.transform();
			// console.log(result);
			var JSONoutput = [];
			var rows = data.rows;
			var columns = data.columns;


			for (var i = 0, rowlen = rows.length; i < rowlen; i++) {
				//someFn(arr[i]);
				var oneDocument = {};
				for (var n = 0, collen = columns.length; n < collen; n++) {
					var coldata = columns[n].alias;
					var rowdata = rows[i][n];
					oneDocument[coldata] = rowdata;
					//console.log(oneDocument);
				}
				console.log(oneDocument);
				JSONoutput.push(oneDocument);
			}


			// rows.forEach(function (row) {
			// 	var oneDocument;
			// 	columns.forEach(function (name) {
			// 		oneDocument[name.alias] = row;
			// 		console.log(oneDocument);
			// 	}, this);
			// 	console.log(oneDocument);
			// 	JSONoutput.push(oneDocument);
			// }, this);


		})
		.catch(function (err) {
			// Deal with the error
			console.log(err);
		});
}



// var bb_oauth2client = require('./app/controllers/oauth2');
// var auth = bb_oauth2client.oAuth2Client;


// var googleoauth2client = require('./app/controllers/oauth2');
// var auth = googleoauth2client.OAuth2Client;

// console.log(auth);

// var request = require('request');
// var OauthToken;
// // Contains:
// // OauthToken.expires_in
// // OauthToken.access_token
// var expire_time;

// var request = require('request');
// function callBB_API(callback) {
// 	var dateNow = new Date();
// 	if (!(expire_time > dateNow)) {
// 		request({
// 			url: 'https://bb.nsuok.edu/learn/api/public/v1/oauth2/token',
// 			method: 'POST',
// 			auth: {
// 				user: 'db5c6a6b-6820-4be0-85f9-23a688dbac02',
// 				pass: 'PNi3rl37msZziybykTUSwLK6sNnazRbF'
// 			},
// 			form: {
// 				'grant_type': 'client_credentials'
// 			}
// 		}, function (err, res) {
// 			if (err) {
// 				console.log("Error getting Oauth2 Token: ", err);
// 			}
// 			var json = JSON.parse(res.body);
// 			OauthToken = json;
// 			console.log("Got Access Token:", json.access_token);
// 			OauthToken = json;
// 			if (OauthToken.expires_in) {

// 				expire_time = new Date(dateNow.getTime() + OauthToken.expires_in * 1000);
// 				console.log('expiration in seconds: ' + OauthToken.expires_in);
// 				console.log('Date Now time is:    ' + dateNow);
// 				console.log('Date Now time i2:    ' + Date.now());
// 				console.log('token Expire time is:' + expire_time);
// 				return callback(OauthToken.access_token);
// 			}

// 		});
// 	}
// 	else {
// 		console.log("Got Access Token:", OauthToken.access_token);
// 		return callback(OauthToken.access_token);
// 	}

// }

// //calls function at set interval in seconds
// function startInterval(callback, seconds, options) {
// 	callback(options);
// 	return setInterval(callback, seconds * 1000, options);
// }

//calls google for webhooks from google reports
//startInterval(googleWatch.watch, config.googleConfig.ttl - config.googleConfig.ttl_offset, config.googleConfig.eventTypes)

//calls google for Polling from google reports
//startInterval(getOAuth2Token, 5);

// var request = require('request');
// var authToken;
// request({
// 	url: 'https://bb.nsuok.edu/learn/api/public/v1/oauth2/token',
// 	method: 'POST',
// 	auth: {
// 		user: 'db5c6a6b-6820-4be0-85f9-23a688dbac02',
// 		pass: 'PNi3rl37msZziybykTUSwLK6sNnazRbF'
// 	},
// 	form: {
// 		'grant_type': 'client_credentials'
// 	}
// }, function (err, res) {
// 	var json = JSON.parse(res.body);
// 	authToken = json;
// 	console.log("Access Token:", json.access_token);

// });
// function getCourses(auth2,nextPageToken) {
// 	//var auth = getOAuth2Token();
// 	//var nextPageToken;
// 	var params = {
// 		url: 'https://bb.nsuok.edu/learn/api/public/v1/courses',
// 		method: 'GET',
// 		auth: {
// 			bearer: auth2
// 		},
// 		form: {
// 			'limit': 100
// 		}
// 	};
// 	if (nextPageToken) {
// 		params.url = 'https://bb.nsuok.edu' + nextPageToken
// 	}
// 	request(params, function (err, res) {
// 		if (err) {
// 			console.log("error in course: " + err);
// 		}
// 		var json = JSON.parse(res.body);
// 		console.log("courses:", JSON.stringify(json.results));
// 		if(json.paging.nextPage){
// 			getCourses(auth2,json.paging.nextPage);
// 		}
// 	});

// }


// function getPageOfEvents(params, nextPageToken) {
// 	if (nextPageToken)
// 		params.pageToken = nextPageToken;
// 	admin.activities.list(params, function (err, response) {
// 		if (err) {
// 			invokeLater(err, function () {
// 				getAndStoreAllEvents(params.applicationName);
// 			});
// 			return;
// 		}
// 		if (response.items) {
// 			//saveEventsToMongoDB(response.items);
// 			Event.collection.insert(response.items, onInsert);
// 			function onInsert(err, docs) {
// 				if (err) {
// 					if (err.code == '11000') {
// 						console.log("WARN event already processed. Duplicate")
// 					}
// 					else {
// 						console.log("Error saving event from Polling: " + err);
// 					}
// 				}
// 				else { //If no errors
// 					console.log(`SAVED ${docs.insertedCount} ${params.applicationName} Events from Polling to DB`);
// 					//console.info('%d events were successfully stored.', docs.length);
// 				}
// 				var insertedIds = docs.insertedIds;
// 				console.log(`IDS ${insertedIds}`);

// 			}
// 		}

// 		if (response.nextPageToken)
// 			getPageOfEvents(params, response.nextPageToken);
// 	});
// }
// callBB_API(getCourses);
// var auth3 = getOAuth2Token();
// console.log(auth3());
// getCourses(auth3);



//"/learn/api/public/v1/courses?offset=100"
// get terms
// request({
// 	url: 'https://bb.nsuok.edu/learn/api/public/v1/terms',
// 	method: 'GET',
// 	auth: {
// 		bearer: authToken.access_token
// 	},
// 	form: {
// 		//'limit': 5
// 	}
// }, function (err, res) {
// 	var json = JSON.parse(res.body);
// 	console.log("Access Token:", JSON.stringify(json.results));
// });









//don't show the log when it is test
if (config.env !== 'test') {
	//use morgan to log at command line
	//app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
	app.use(morgan('dev')); //'dev' outputs the colorized simple output
}

//parse application/json and look for raw text                                        
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));

app.get("/", (req, res) => res.json({ message: "Please Events Post to " + config.googleConfig.web_hook_url }));

app.route("/event")
	.get(event.getEvents)
	.post(event.postEvent);
app.route("/event/:id")
	.get(event.getEvent)
	.delete(event.deleteEvent)
	.put(event.updateEvent);


app.listen(config.port);
console.log("Listening on port " + config.port);

module.exports = app; // for testing