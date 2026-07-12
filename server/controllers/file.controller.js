
import { File } from "../models/file.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import fs from "fs"; //fs → Node’s filesystem module, used to delete temporary local files.
import mongoose from "mongoose";
import redis from "../config/redis.js";


const userFileCacheKey = (userId) => `files:${userId}`;

const searchFiles = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const userId = req.user?._id;

  if (!q || !q.trim()) {
    return res.status(200).json(new ApiResponse(200, [], "No query provided."));
  }

  const files = await File.find({
    ownerId: userId,
    fileName: { $regex: q.trim(), $options: "i" },
  }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, files, "Search results fetched."));
});


const uploadFile = asyncHandler(async (req, res) => {

    const localFilePath = req.file?.path;
    
    let {accessList} = req.body;
    let accessListAsObjectIds = accessList

    if (!localFilePath) {
        throw new ApiError(400, "File is required for upload.");
    } 
    
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    console.log(cloudinaryResponse)

    if (!cloudinaryResponse || !cloudinaryResponse.url) {
        fs.unlinkSync(localFilePath); 
        throw new ApiError(500, "Error while uploading file to Cloudinary.");
    } 

    const file = await File.create({
        fileUrl: cloudinaryResponse.secure_url,
        fileName: req.file.originalname,
        ownerId: req.user?._id, 
        accessList: accessListAsObjectIds || []
    });


    //Clean up the locally saved temporary file as it's now on Cloudinary
    fs.unlinkSync(localFilePath);
    
    await redis.del(userFileCacheKey(req.user._id.toString()));

    const responselink = `http://localhost:8000/api/v1/files/download/${file._id}`

   return res.status(201).json(
        new ApiResponse(201, { downloadLink: responselink, fileId: file._id }, "File uploaded successfully.")
      );
});



const downloadFile = asyncHandler(async (req, res) => {

    const { fileId } = req.params;
    console.log(fileId)
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new ApiError(400, "Invalid file ID format.");
    }

    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }

    // const file = await File.findById(fileId);

    // if (!file) {
    //     throw new ApiError(404, "File not found.");
    // }

      //// CACHE CHECK ///
    const metaCacheKey = `filemeta:${userId}:${fileId}`;
    const cached = await redis.get(metaCacheKey);

    let file;
    if (cached) {
        file = JSON.parse(cached);
    } else {
        file = await File.findById(fileId);

        if (!file) {
            throw new ApiError(404, "File not found.");
        }

        await redis.set(metaCacheKey, JSON.stringify(file), "EX", 600);
    }

    const hasPermission =
        file.ownerId.toString() === userId.toString() ||
        file.accessList.some(allowedUserId => allowedUserId.toString() === userId.toString());

    if (!hasPermission) {
        throw new ApiError(403, "You do not have permission to access this file.");
    }


    // Cloudinary's `fl_attachment` flag prompts the browser to download the file instead of displaying it.
    const baseUrl = file.fileUrl.substring(0, file.fileUrl.lastIndexOf('/upload/') + 8);
    const publicIdWithFormat = file.fileUrl.substring(baseUrl.length);

    if (!baseUrl || !publicIdWithFormat) {
        throw new ApiError(500, "Invalid Cloudinary URL format in the database."); 
    }
    
    const actualDownloadLink = `${baseUrl}fl_attachment/${publicIdWithFormat}`;
    //BASE_URL + TRANSFORMATION + PUBLIC_ID---cloudinary urls are built like this...
    res.status(201).json(
        new ApiResponse(201,{actualDownloadLink},"Actual Download url sent successfully")
    )
});




const deleteFile = asyncHandler(async (req, res) => {

    const { fileId } = req.params;
    const userId = req.user?._id;

    if (!fileId) {
        throw new ApiError(400, "File ID is required.");
    }

    const file = await File.findById(fileId);

    if (!file) {
        throw new ApiError(404, "File not found.");
    }

    // 1. Authorization: Check if the requester is the owner
    if (file.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this file.");
    }

    // 2. Delete from Cloudinary and Database
    await deleteFromCloudinary(file.cloudinaryPublicId);
    await File.findByIdAndDelete(fileId);
    
    await redis.del(userFileCacheKey(userId.toString()));
    await redis.del(`filemeta:${userId}:${fileId}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "File deleted successfully.")
    );
});



export {
    uploadFile,
    downloadFile,
    deleteFile,
    searchFiles
};
