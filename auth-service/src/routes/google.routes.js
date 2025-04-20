import express from "express";
import { GoogleController } from "../controllers/google.controller.js";

const router = express.Router();
const googleController = new GoogleController();

// Google OAuth routes
router.post("/auth", googleController.googleAuth.bind(googleController));

export default router;
