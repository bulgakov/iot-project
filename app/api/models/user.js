import mongoose from 'mongoose';
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: [true], unique: true },
    password: { type: String, required: [true] },
    name: { type: String, required: [true] }
});

// Validator
userSchema.plugin(uniqueValidator, { message: 'Email already exists.'});

// Model
const User = mongoose.model('User', userSchema);

export default User; 