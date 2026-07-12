import { Router } from "express";
import { uploadFile, downloadFile, deleteFile } from "../controllers/file.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { rateLimitUpload } from "../middleware/rateLimiter.js";

import { searchFiles } from "../controllers/file.controller.js";
const router = Router();

router.route('/upload').post(
    verifyJWT,
    rateLimitUpload,    
    upload.single("file"), //multer middleware
    uploadFile
);

router.route('/download/:fileId').post(
    verifyJWT,
    downloadFile
);

router.route("/search").get(verifyJWT, searchFiles);
 

export default router;
