import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    deviceId: { type: String, required: [true], unique: true },
    password: { type: String, required: [true] },
    name: { type: String, required: [true] },
    selected: { type: Boolean, required: [true], default: false },
    userId: { type: String, required: [true] },
    templateId: { type: String, required: [true] },
    createdTime: { type: Number }
});

// Validator
deviceSchema.plugin(uniqueValidator, { message: 'Device already exists.'});

// Model
const Device = mongoose.model('Device', deviceSchema);

export default Device; 