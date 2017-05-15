let mongoose = require('mongoose');
let Schema = mongoose.Schema;
//let uniqueValidator = require('mongoose-unique-validator');
mongoose.Promise = require('bluebird');

//WebhookHeader schema definition
let WebhookHeaderSchema = new Schema({    insertedAt: { type: Date, default: Date.now }}, { strict: false });
//   {
//     host: { type: String, required: false },
//   },
//   {
//     versionKey: false
//   },
//   {
//     strict: false
//   }
// );

// Sets the insertedAt parameter equal to the current time
WebhookHeaderSchema.pre('save', next => {
  now = new Date();
  if (!this.insertedAt) {
    this.insertedAt = now;
  }
  next();
});

//Exports the WebhookHeaderSchema for use elsewhere.
module.exports = mongoose.model('WebhookHeader', WebhookHeaderSchema);