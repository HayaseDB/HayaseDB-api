// External imports
const express = require('express');
const morgan = require('morgan');
const { connectToMongoDB } = require('./utils/mongo');

// Middleware imports
require('./utils/validateEnv');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');


// Controllers
const userRoutes = require('./routes/userRoutes');

// Define express as "app"
const app = express();

// Middleware
if (process.env.LOG_LEVEL == "normal" || process.env.LOG_LEVEL == "debug") {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB
connectToMongoDB();

// Routes
app.use('/user', userRoutes);

// Handlers
app.use(errorHandler);
app.use(notFoundHandler);


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
