// routes/share.route.js
import { Router } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import redis from "../config/redis.js";
import { File } from "../models/file.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middleware/authMiddleware.js"               

import { User } from "../models/User.js";
import { Notification } from "../models/notification.model.js";
import { sendShareEmail } from "../utils/sendEmail.js";

const router = Router();

router.post("/:fileId/share-to-email", verifyJWT, asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { email } = req.body;
  const senderId = req.user?._id;

  if (!email) throw new ApiError(400, "Recipient email is required.");

  if (!mongoose.Types.ObjectId.isValid(fileId)) throw new ApiError(400, "Invalid file ID.");


  const file = await File.findById(fileId);

  if (!file) throw new ApiError(404, "File not found.");

  if (file.ownerId.toString() !== senderId.toString()) {
    throw new ApiError(403, "You are not authorized to share this file.");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const key = `share:${token}`;
  await redis.set(
    key,
    JSON.stringify({ fileId: file._id, fileName: file.fileName, fileUrl: file.fileUrl }),
    "EX",
    1200
  );
  

  const shareUrl = `${process.env.CLIENT_URL}/share/${token}`;

  const recipientUser = await User.findOne({ email: email.toLowerCase().trim() });

  
    await sendShareEmail({
    to: email,
    fileName: file.fileName,
    shareUrl,
    senderName: req.user.name || req.user.email,
  });

  let method = "email";

  if (recipientUser) {
    await Notification.create({
      recipientId: recipientUser._id,
      senderId,
      fileName: file.fileName,
      shareUrl,
    });
    method = "email+in-app";
  }

    return res.status(201).json(
      new ApiResponse(201, { method: "email", shareUrl }, "Share link emailed successfully.")
    );
  }
));



router.post("/:fileId/share", verifyJWT, asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new ApiError(400, "Invalid file ID format.");
  }

  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found.");
  }

  if (file.ownerId.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to share this file.");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const key = `share:${token}`;

  await redis.set(
    key,
    JSON.stringify({ fileId: file._id, fileName: file.fileName, fileUrl: file.fileUrl }),
    "EX",
    1200
  );

  const shareUrl = `${process.env.CLIENT_URL}/share/${token}`;

  return res.status(201).json(
    new ApiResponse(201, { shareUrl }, "Share link generated successfully.")
  );
}));




router.get("/share/:token", asyncHandler(async (req, res) => {
  const key = `share:${req.params.token}`;
  const data = await redis.get(key);

  if (!data) {
    throw new ApiError(410, "This link has expired or is invalid.");
  }

  const ttl = await redis.ttl(key);
  const { fileName, fileUrl } = JSON.parse(data);


  const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/upload/') + 8);
  const publicIdWithFormat = fileUrl.substring(baseUrl.length);
  const actualDownloadLink = `${baseUrl}fl_attachment/${publicIdWithFormat}`;

  return res.status(200).json(
    new ApiResponse(200, { fileName, fileUrl: actualDownloadLink, expiresIn: ttl }, "Shared file details fetched.")
  );
}));

export default router;