// auth-service/src/index.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Request logging middleware
// app.use((req, res, next) => {
//   logger.info(`Incoming request: ${req.method} ${req.url}`, {
//     body: req.body,
//     headers: req.headers,
//   });
//   next();
// });

// Routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB", {
      timestamp: new Date().toISOString(),
    });
    app.listen(process.env.PORT, () => {
      logger.info(`Auth service running on port ${process.env.PORT}`, {
        timestamp: new Date().toISOString(),
      });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
