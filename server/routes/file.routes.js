import { Router } from "express";
import { uploadFile, downloadFile, deleteFile } from "../controllers/file.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = Router();

router.route('/upload').post(
    verifyJWT,
    upload.single("file"), 
    uploadFile
);

router.route('/download/:fileId').post(
    verifyJWT,
    downloadFile
);
 
export default router;
