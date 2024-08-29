const mongoose = require('mongoose');
const { Schema } = mongoose;

const keySchema = new Schema({
    title: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    rateLimit: { type: Number, default: 1000 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Key', keySchema, 'Keys');
