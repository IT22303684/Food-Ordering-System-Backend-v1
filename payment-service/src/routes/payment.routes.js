import express from "express";
import {
  createPayment,
  handleNotification,
  handleReturn,
  handleCancel,
  getAllPayments,
  refundPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/process", createPayment);
router.post("/notify", handleNotification);
router.get("/return", handleReturn);
router.get("/cancel", handleCancel);
router.get("/all", getAllPayments);
router.post("/refund", refundPayment);

export default router;