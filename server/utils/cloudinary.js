import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'; 

import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:  process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary  = async (localfilepath) => {
    try{
        if(!localfilepath)
        {
            console.log("file path not found");
            return null;
        }

            const res = await cloudinary.uploader.upload(localfilepath, {
                resource_type : 'auto'
            })
            console.log("file uploaded on cloudinary",res.url);
            return res;

    }catch(err){
            console.error("Cloudinary Upload Error:", err);
        fs.unlinkSync(localfilepath); // removes the locally saved temperory file as upload operation failed
        return null;
    }
}

export {uploadOnCloudinary};