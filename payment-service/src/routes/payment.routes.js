import express from "express";
import {
  createPayment,
  handleNotification,
  handleReturn,
  handleCancel,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/process", createPayment);
router.post("/notify", handleNotification);
router.get("/return", handleReturn);
router.get("/cancel", handleCancel);

export default router;