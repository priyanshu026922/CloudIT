import { Router } from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.get("/", verifyJWT, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched."));
}));

router.patch("/:id/read", verifyJWT, asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });

  return res.status(200).json(new ApiResponse(200, {}, "Marked as read."));
  
}));

export default router;