
const express = require('express');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const animeRoutes = require('./routes/animeRoutes');
const setupSwagger = require("./swagger/swagger");
const cors = require("./config/cors")
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors);
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/anime', animeRoutes);

setupSwagger(app);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer();
