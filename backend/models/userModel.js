const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hash it in real app
    role: { type: String, enum: ["admin","staff"], required: true }
});

module.exports = mongoose.model('User', userSchema);
