const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Routes
const blogRoutes = require("./router/blogRoutes");
const govtRouter = require("./router/GovtRouter");
const contactRoutes = require("./router/ContactRouter");
const subscriberRouter = require("./router/subscriberRouter");

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
let isConnected = false;

async function connectToMongoDB() {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);

        isConnected = true;
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
    }
}

// Connect before every request (only first request actually connects)
app.use(async (req, res, next) => {
    if (!isConnected) {
        await connectToMongoDB();
    }
    next();
});

// Routes
app.use("/api", blogRoutes);
app.use("/api-govt", govtRouter);
app.use("/api", contactRoutes);
app.use("/api", subscriberRouter);

module.exports = app;