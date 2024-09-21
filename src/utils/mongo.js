const mongoose = require('mongoose');

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } = process.env;
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo:27017/${MONGO_DATABASE}`, {
      retryWrites: true,
      writeConcern: { w: 'majority' },
      authSource: 'admin'
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectToMongoDB };