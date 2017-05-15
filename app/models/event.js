let mongoose = require('mongoose');
let Schema = mongoose.Schema;
//let uniqueValidator = require('mongoose-unique-validator');
mongoose.Promise = require('bluebird');

//parametersArray schema definition
let parametersArray = new Schema(
  {
    name: { type: String },
    value: { type: String },
    intValue: { type: Number },
    boolValue: { type: Boolean }
  }
);
//eventsArray schema definition
let eventsArray = new Schema(
  {
    type: { type: String },
    name: { type: String },
    parameters: [parametersArray]
  }
);

//event schema definition
let EventSchema = new Schema(
  {
    kind: { type: String, required: true },
    id: {
      type: Object, required: true,
      time: { type: Date, required: true },
      uniqueQualifier: { type: Number, required: true, unique: true, },
      applicationName: { type: String, required: true },
      customerId: { type: String, required: true },
    },
    actor: {
      type: Object, required: true,
      callerType: { type: String },
      email: { type: String },
      profileId: { type: Number }
    },
    ownerDomain: { type: String },
    ipAddress: { type: String },
    source: { type: String },
    events: [eventsArray],
    insertedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false
  }
);

// // Apply the uniqueValidator plugin to EventSchema.
// EventSchema.plugin(uniqueValidator);

// Sets the insertedAt parameter equal to the current time
EventSchema.pre('save', next => {
  now = new Date();
  if (!this.insertedAt) {
    this.insertedAt = now;
  }
  next();
});

//Exports the EventSchema for use elsewhere.
module.exports = mongoose.model('event', EventSchema);