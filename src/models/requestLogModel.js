const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    path: { type: String, required: true },
    method: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const RequestLog = mongoose.model('RequestLog', requestLogSchema);

module.exports = RequestLog;
