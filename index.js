const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================
// Middleware
// ======================
app.use(cors());
app.use(express.json());

// ======================
// Import Routes
// ======================
const blogRoutes = require("./router/blogRoutes");
const govtRouter = require("./router/GovtRouter");
const contactRoutes = require("./router/ContactRouter");
const subscriberRouter = require("./router/subscriberRouter");

// ======================
// MongoDB Connection
// ======================
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI not found in .env file");
    }

    console.log("🔄 Connecting to MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4 (helps with DNS issues)
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log("📂 Database:", mongoose.connection.db.databaseName);
    console.log("🌐 Host:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error("Message:", err.message);

    if (err.reason) {
      console.error("Reason:", err.reason);
    }

    process.exit(1);
  }
};

// Connect Database
connectDB();

// ======================
// Mongoose Connection Events
// ======================
mongoose.connection.on("connecting", () => {
  console.log("🟡 Connecting to MongoDB...");
});

mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose Connected");
});

mongoose.connection.on("open", () => {
  console.log("📂 MongoDB Connection Open");
});

mongoose.connection.on("error", (err) => {
  console.log("🔴 Mongoose Error");
  console.log(err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟠 Mongoose Disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 Mongoose Reconnected");
});

mongoose.connection.on("disconnecting", () => {
  console.log("🟡 Mongoose Disconnecting...");
});

mongoose.connection.on("close", () => {
  console.log("🔒 MongoDB Connection Closed");
});

// ======================
// API Routes
// ======================
app.use("/api", blogRoutes);
app.use("/api-govt", govtRouter);
app.use("/api", contactRoutes);
app.use("/api", subscriberRouter);

// ======================
// Home Route
// ======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend Running Successfully",
  });
});

// ======================
// Database Status Route
// ======================
app.get("/db-status", (req, res) => {
  res.status(200).json({
    success: true,
    readyState: mongoose.connection.readyState,
    state:
      mongoose.connection.readyState === 0
        ? "Disconnected"
        : mongoose.connection.readyState === 1
        ? "Connected"
        : mongoose.connection.readyState === 2
        ? "Connecting"
        : "Disconnecting",
    database: mongoose.connection.db
      ? mongoose.connection.db.databaseName
      : null,
    host: mongoose.connection.host || null,
  });
});

// ======================
// 404 Route
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
  });
});

// ======================
// Run Locally
// ======================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
  });
}

// ======================
// Export for Vercel
// ======================
module.exports = app;