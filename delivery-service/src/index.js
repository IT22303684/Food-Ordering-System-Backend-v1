import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import deliveryRoutes from "./routes/delivery.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/delivery", deliveryRoutes);

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/delivery-service"
  )
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  logger.info(`Delivery service running on port ${PORT}`);
});
