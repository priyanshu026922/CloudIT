import multer from 'multer';
import path from 'path';

//tells Multer where to temporarily store uploaded files and how to name them before 
// they are sent to Cloudinary.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'temp')) // ✅ correct folder
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ //upload is now a middleware
     storage,
})

// What happens when request hits this middleware
      // Multer reads multipart/form-data
      // Saves file in public/temp
      // Attaches file info to req.file
      // Passes control to controller