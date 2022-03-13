import mongoose from 'mongoose';
//const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    userId: { type: String, required: [true] },
    deviceId: { type: String, required: [true] },
    variable: { type: String, required: [true] },
    value: { type: String, required: [true] },
    createdTime: { type: Number, required: [true] }
});

// Validator
//dataSchema.plugin(uniqueValidator, { message: 'Device already exists.'});

// Model
const Data = mongoose.model('Data', dataSchema);

export default Data; 