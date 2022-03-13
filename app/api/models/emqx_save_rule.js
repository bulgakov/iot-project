import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const saveRulesSchema = new Schema({
    userId: { type: String, required: [true] },
    deviceId: { type: String, required: [true] },
    emqxRuleId: { type: String, required: [true] },
    status: { type: Boolean, required: [true] }
});

// Validator
// templateSchema.plugin(uniqueValidator, { message: 'Template already exists.'});

// Model
const SaveRule = mongoose.model('SaveRule', saveRulesSchema);

export default SaveRule; 