const mongoose = require('mongoose');
const { Schema } = mongoose;

const changeRequestSchema = new Schema({
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submitDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    changes: {
        type: Map,
        of: Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ChangeRequest', changeRequestSchema, 'ChangeRequests');
