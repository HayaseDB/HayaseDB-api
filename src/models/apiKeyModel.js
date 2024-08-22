const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    key: { 
        type: String, 
        required: true, 
        unique: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    accessCount: { 
        type: Number, 
        default: 0 
    },
    rateLimit: { 
        type: Number, 
        default: 1000 
    },
    restrictions: { 
        type: String, 
        default: null 
    },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date }
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema, 'ApiKeys');
module.exports = ApiKey;
