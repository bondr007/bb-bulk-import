//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Event = require('../app/models/event');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();


chai.use(chaiHttp);

//Our parent block
describe('Events', () => {
	beforeEach((done) => { //Before each test we empty the database
		Event.remove({}, (err) => { 
		   done();		   
		});		
	});
 /*
  * Test the /GET route
  */
//   describe('/GET event', () => {
// 	  it('it should GET all the events', (done) => {
// 			chai.request(server)
// 		    .get('/event')
// 		    .end((err, res) => {
// 			  	res.should.have.status(200);
// 			  	res.body.should.be.a('array');
// 			  	res.body.length.should.be.eql(0);
// 		      done();
// 		    });
// 	  });
//   });
 /*
  * Test the /POST route
  */
  describe('/POST event', () => {
	  it('it should not POST a event without id object', (done) => {
			let event = {
				"kind": "admin#reports#activity",
				"etag": "\"6KGrH_UY2JDZNpgjPKUOF8yJF1A/kj4rAByEDNvzZYA4QDYbzl-vA4A\"",
				"actor": {
					"email": "test@nsuok.edu",
					"profileId": "12345678901234567890"
				},
				"ipAddress": "127.0.0.0",
				"events": [
					{
						"type": "login",
						"name": "login_success",
						"parameters": [
							{
								"name": "login_type",
								"value": "google_password"
							},
							{
								"name": "is_suspicious",
								"boolValue": true
							}
						]
					}
				]
			}
			chai.request(server)
		    .post('/event')
		    .send(event)
		    .end((err, res) => {
			  	res.should.have.status(208);
			  	res.body.should.be.a('object');
			  	res.body.should.have.property('errors');
			  	// res.body.errors.should.have.property('id');
			  	// res.body.errors.pages.should.have.property('kind').eql('required');
		      done();
		    });
	  });
	  it('it should POST a event ', (done) => {
			let event = {
				"kind": "admin#reports#activity",
				"id": {
					"time": "2017-00-01T00:00:00.000Z",
					"uniqueQualifier": "12345678901234567890",
					"applicationName": "login",
					"customerId": "C04kft3e1"
				},
				"etag": "\"6KGrH_UY2JDZNpgjPKUOF8yJF1A/kj4rAByEDNvzZYA4QDYbzl-vA4A\"",
				"actor": {
					"email": "test@nsuok.edu",
					"profileId": "12345678901234567890"
				},
				"ipAddress": "127.0.0.0",
				"events": [
					{
						"type": "login",
						"name": "login_success",
						"parameters": [
							{
								"name": "login_type",
								"value": "google_password"
							},
							{
								"name": "is_suspicious",
								"boolValue": true
							}
						]
					}
				]
			}
			chai.request(server)
		    .post('/event')
		    .send(event)
		    .end((err, res) => {
			  	res.should.have.status(200);
			  	res.body.should.be.a('object');
			  	res.body.should.have.property('message').eql('Event successfully added!');
			  	res.body.event.should.have.property('id');
			  	//res.body.event.should.have.property('etag');
			  	res.body.event.should.have.property('actor');
			  	res.body.event.should.have.property('ipAddress');
		      done();
		    });
	  });
  });
 /*
  * Test the /GET/:id route
  */
//   describe('/GET/:id event', () => {
// 	  it('it should GET a event by the given id', (done) => {
// 	  	let event = new Event({ title: "The Lord of the Rings", author: "J.R.R. Tolkien", year: 1954, pages: 1170 });
// 	  	event.save((err, event) => {
// 	  		chai.request(server)
// 		    .get('/event/' + event.id)
// 		    .send(event)
// 		    .end((err, res) => {
// 			  	res.should.have.status(200);
// 			  	res.body.should.be.a('object');
// 			  	res.body.should.have.property('title');
// 			  	res.body.should.have.property('author');
// 			  	res.body.should.have.property('pages');
// 			  	res.body.should.have.property('year');
// 			  	res.body.should.have.property('_id').eql(event.id);
// 		      done();
// 		    });
// 	  	});
			
// 	  });
//   });
//  /*
//   * Test the /PUT/:id route
//   */
//   describe('/PUT/:id event', () => {
// 	  it('it should UPDATE a event given the id', (done) => {
// 	  	let event = new Event({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778})
// 	  	event.save((err, event) => {
// 				chai.request(server)
// 			    .put('/event/' + event.id)
// 			    .send({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1950, pages: 778})
// 			    .end((err, res) => {
// 				  	res.should.have.status(200);
// 				  	res.body.should.be.a('object');
// 				  	res.body.should.have.property('message').eql('Event updated!');
// 				  	res.body.event.should.have.property('year').eql(1950);
// 			      done();
// 			    });
// 		  });
// 	  });
//   });
//  /*
//   * Test the /DELETE/:id route
//   */
//   describe('/DELETE/:id event', () => {
// 	  it('it should DELETE a event given the id', (done) => {
// 	  	let event = new Event({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778})
// 	  	event.save((err, event) => {
// 				chai.request(server)
// 			    .delete('/event/' + event.id)
// 			    .end((err, res) => {
// 				  	res.should.have.status(200);
// 				  	res.body.should.be.a('object');
// 				  	res.body.should.have.property('message').eql('Event successfully deleted!');
// 				  	res.body.result.should.have.property('ok').eql(1);
// 				  	res.body.result.should.have.property('n').eql(1);
// 			      done();
// 			    });
// 		  });
// 	  });
//   });
});
  