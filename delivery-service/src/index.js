import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import { setupSocketHandlers } from "./socket/delivery.socket.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Make io instance available to routes
app.set("io", io);

// Routes
app.use("/api/delivery", deliveryRoutes);

// Socket.IO setup
setupSocketHandlers(io);

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/delivery-service"
  )
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  logger.info(`Delivery service running on port ${PORT}`);
});
