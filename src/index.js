// External imports
const express = require('express');
const morgan = require('morgan');
const { connectToMongoDB } = require('./utils/mongo');

// Middleware imports
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');


// Define express as "app"
const app = express();

// Middleware
if (process.env.LOG_LEVEL === "normal" || process.env.LOG_LEVEL === "debug") {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB
connectToMongoDB().then(r =>
  console.log("Connected to MongoDB")
);

const cors = require('cors')


// Routes
const userRoutes = require("./routes/userRoutes");
const apiRoutes = require("./routes/apiRoutes");
const {getSystemHealth} = require("./services/healthService");
const {webAuth, corsOptions} = require("./middlewares/corsMiddleware");
const {clearOrphanedMedia} = require("./utils/documentUtil");
// clearOrphanedMedia()

app.use(cors(corsOptions));


app.use('/user', userRoutes);
app.use('/api', apiRoutes);
app.get('/health', getSystemHealth);

// Handlers
app.use(errorHandler);
app.use(notFoundHandler);


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
