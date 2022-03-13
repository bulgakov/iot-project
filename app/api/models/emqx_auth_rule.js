import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const emqxAuthRuleSchema = new Schema({
    userId: { type: String, required: [true] },
    deviceId: { type: String },
    username: { type: String, required: [true] },
    password: { type: String, required: [true] },
    publish:  { type: Array },
    subscribe: { type: Array },
    type: { type: String, required: [true] },
    createdTime: { type: Number },
    updatedTime: { type: Number }
});

// Validator
// templateSchema.plugin(uniqueValidator, { message: 'Template already exists.'});

// Model
const EmqxAuthRule = mongoose.model('EmqxAuthRule', emqxAuthRuleSchema);

export default EmqxAuthRule; 