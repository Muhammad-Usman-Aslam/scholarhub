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
      throw new Error("MONGO_URI not found in .env");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");

    console.log(
      "Database:",
      mongoose.connection.db.databaseName
    );
  } catch (err) {
    console.error("❌ MongoDB Connection Failed");
    console.error(err);
    process.exit(1);
  }
};

connectDB();

// Connection Events
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose Connected");
});

mongoose.connection.on("error", (err) => {
  console.log("🔴 Mongoose Error");
  console.log(err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose Disconnected");
});

// ======================
// Routes
// ======================
app.use("/api", blogRoutes);
app.use("/api-govt", govtRouter);
app.use("/api", contactRoutes);
app.use("/api", subscriberRouter);

// ======================
// Test Route
// ======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Running Successfully",
  });
});

// Database Status Route
app.get("/db-status", (req, res) => {
  res.json({
    readyState: mongoose.connection.readyState,
    states: {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    },
    database: mongoose.connection.db
      ? mongoose.connection.db.databaseName
      : null,
  });
});

// ======================
// Local Server
// ======================
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 5000;

//   app.listen(PORT, () => {
//     console.log(`🚀 Server Running on Port ${PORT}`);
//   });
// }

// ======================
// Export for Vercel
// ======================
module.exports = app;