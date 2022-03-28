import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const alarmRulesSchema = new Schema({
    userId: { type: String, required: [true] },
    deviceId: { type: String, required: [true] },
    emqxRuleId: { type: String, required: [true] },
    variableName: { type: String, required: [true] },
    variable: { type: String, required: [true] },
    value: { type: Number, required: [true] },
    condition: { type: String, required: [true] },
    triggerTime: { type: Number, required: [true] },
    actions: { type: Array, default: [] },
    status: { type: Boolean, required: [true] },
    counter: { type: Number, required: [true], default: 0 },
    createdTime: { type: Number, required: [true] }
});

// Validator
// templateSchema.plugin(uniqueValidator, { message: 'Template already exists.'});

// Model
const AlarmRule = mongoose.model('AlarmRule', alarmRulesSchema);

export default AlarmRule; 