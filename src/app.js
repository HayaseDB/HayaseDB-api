
const express = require('express');
const { connectDB } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const setupSwagger = require("./swagger/swagger");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/auth', authRoutes);

setupSwagger(app);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
