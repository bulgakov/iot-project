import mongoose from 'mongoose';
//const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    userId: { type: String, required: [true] },
    deviceId: { type: String, required: [true] },
    emqxRuleId: { type: String, required: [true] },
    payload: { type: Object },
    topic: { type: String, required: [true] },
    variable: { type: String, required: [true] },
    value: { type: Number, required: [true] },
    condition: { type: String, required: [true] },
    readed: { type: Boolean, required: [true] },
    createdTime: { type: Number, required: [true] }
});

// Validator
//notificationSchema.plugin(uniqueValidator, { message: 'Device already exists.'});

// Model
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 