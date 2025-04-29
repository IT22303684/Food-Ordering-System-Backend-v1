import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import logger from "./utils/logger.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import categoryRoutes from "./routes/category.route.js";

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
app.use(morgan("dev"));

// Routes 
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurants", menuRoutes);
app.use("/api/restaurants", categoryRoutes);

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
      logger.info(`Resturent service running on port ${process.env.PORT}`, {
        timestamp: new Date().toISOString(),
      });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });