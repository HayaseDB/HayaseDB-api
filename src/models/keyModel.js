const mongoose = require('mongoose');
const { Schema } = mongoose;

const keySchema = new Schema({
    title: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rateLimit: { type: Number, default: 60 },
    limitRequestsCounter: { type: Number, default: 0 },
    requests: { type: Number, default: 0 },
    rateLimitActive: { type: Boolean, default: true },
    lastRequest: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

keySchema.methods.resetRequestCount = function() {
    this.limitRequestsCounter = 0;
    this.lastRequest = Date.now();
};

const Key = mongoose.model('Key', keySchema, 'Keys');

module.exports = Key;
