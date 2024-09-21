const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongo:27017/${process.env.MONGO_DATABASE}`, {
      retryWrites: true,
      writeConcern: { w: 'majority' },
      authSource: 'admin'
    });
    isConnectedToMongo = true;
  } catch (error) {
    isConnectedToMongo = false;
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const isConnected = () => isConnectedToMongo;

module.exports = { connectToMongoDB, isConnected };
