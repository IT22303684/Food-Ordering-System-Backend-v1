import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers,
  });
  next();
});

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  secure: false,
  timeout: 30000, // 30 seconds timeout
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    console.error("Proxy Error:", err);
    res.status(500).json({
      message: "Service is currently unavailable",
      error: err.message,
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log("Proxying request:", req.method, req.url);
    if (
      req.body &&
      req.headers["content-type"] &&
      req.headers["content-type"].includes("application/json")
    ) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log("Received response:", proxyRes.statusCode);
  },
};

// Auth Service Proxy
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    ...proxyOptions,
    pathRewrite: {
      "^/api/auth": "/api/auth",
    },
  })
);

// Notification Service Proxy
app.use(
  "/api/notifications",
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    ...proxyOptions,
    pathRewrite: {
      "^/api/notifications": "/api/notifications",
    },
  })
);

// Email Service Proxy
app.use(
  "/api/email",
  createProxyMiddleware({
    target: process.env.NOTIFICATION_SERVICE_URL,
    ...proxyOptions,
    pathRewrite: {
      "^/api/email": "/api/email",
    },
  })
);

// Restaurant Service Proxy
app.use(
  "/api/restaurants",
  createProxyMiddleware({
    target: process.env.RESTAURANT_SERVICE_URL,
    ...proxyOptions,
    pathRewrite: {
      "^/api/restaurants": "/api/restaurants",
    },
    onError: (err, req, res) => {
      console.error("Restaurant Service Proxy Error:", err.message, {
        target: process.env.RESTAURANT_SERVICE_URL,
        url: req.url,
      });
      res.status(500).json({
        message: "Service is currently unavailable",
        error: err.message,
      });
    },
  })
);

// Cart Service Proxy
app.use(
  "/api/carts",
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL,
    ...proxyOptions,
    pathRewrite: {
      "^/api/carts": "/api/carts",
    },
    onError: (err, req, res) => {
      console.error("Cart Service Proxy Error:", err.message, {
        target: process.env.CART_SERVICE_URL,
        url: req.url,
      });
      res.status(500).json({
        message: "Service is currently unavailable",
        error: err.message,
      });
    },
  })
);

// Order Service Proxy
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || "http://order-service:3006",
    ...proxyOptions,
    pathRewrite: {
      "^/api/orders": "/api/orders",
    },
    onError: (err, req, res) => {
      console.error("Order Service Proxy Error:", err.message, {
        target: process.env.ORDER_SERVICE_URL || "http://order-service:3006",
        url: req.url,
      });
      res.status(500).json({
        message: "Service is currently unavailable",
        error: err.message,
      });
    },
  })
);

// Delivery Service Proxy
app.use(
  "/api/delivery",
  createProxyMiddleware({
    target: process.env.DELIVERY_SERVICE_URL || "http://localhost:3007",
    ...proxyOptions,
    pathRewrite: {
      "^/api/delivery": "/api/delivery",
    },
    onError: (err, req, res) => {
      console.error("Delivery Service Proxy Error:", err.message, {
        target: process.env.DELIVERY_SERVICE_URL,
        url: req.url,
      });
      res.status(500).json({
        message: "Service is currently unavailable",
        error: err.message,
      });
    },
  })
);

// Payment Service Proxy
app.use(
  "/api/payments",
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3009",
    ...proxyOptions,
    pathRewrite: {
      "^/api/payments": "/api/payments",
    },
    onError: (err, req, res) => {
      console.error("Payment Service Proxy Error:", err.message, {
        target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3009",
        url: req.url,
      });
      res.status(500).json({
        message: "Payment is currently unavailable",
        error: err.message,
      });
    },
  })
);

// Driver Service Proxy
app.use(
  "/api/drivers",
  createProxyMiddleware({
    target: process.env.DRIVER_SERVICE_URL || "http://localhost:3008",
    ...proxyOptions,
    pathRewrite: {
      "^/api/drivers": "/api/drivers",
    },
    onError: (err, req, res) => {
      console.error("Driver Service Proxy Error:", err.message, {
        target: process.env.DRIVER_SERVICE_URL || "http://localhost:3008",
        url: req.url,
      });
      res.status(500).json({
        message: "Service is currently unavailable",
        error: err.message,
      });
    },
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Auth Service URL: ${process.env.AUTH_SERVICE_URL}`);
  console.log(
    `Notification Service URL: ${process.env.NOTIFICATION_SERVICE_URL}`
  );
  console.log(`Restaurant Service URL: ${process.env.RESTAURANT_SERVICE_URL}`);
  console.log(`Cart Service URL: ${process.env.CART_SERVICE_URL}`);
  console.log(`Order Service URL: ${process.env.ORDER_SERVICE_URL}`);
  console.log(`Paymnet Service URL: ${process.env.PAYMENT_SERVICE_URL}`);
  console.log(
    `Delivery Service URL: ${
      process.env.DELIVERY_SERVICE_URL || "http://localhost:3007"
    }`
  );
  console.log(
    `Driver Service URL: ${
      process.env.DRIVER_SERVICE_URL || "http://localhost:3008"
    }`
  );
});
