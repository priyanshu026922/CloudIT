import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js'; 
import jwt from 'jsonwebtoken'
import {File} from '../models/file.model.js'
import redis from '../config/redis.js' 

const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

const generateAccessAndRefreshToken = async (userId) => {
    
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(); //Used to generate a NEW access token
        

        await redis.set(`rt:${userId}`, refreshToken,"EX",REFRESH_TOKEN_EXPIRY);

        return {accessToken,refreshToken};

    } catch (error) {
        console.error("EXACT ERROR:", error.message);  // ADD THIS LINE
        console.error("STACK:", error.stack);    
        throw new ApiError(500,"Something went wrong while generateAccessAndRefreshToken");
    }
}



const registerUser = asyncHandler(async (req,res) => {

    const {name,email,password} = req.body;

    //Checks if any field is empty or blank
    if([name,email,password].some((feild) => {
        return (feild?.trim() === "")
    }))
    {
        throw new ApiError(400,"All feilds are required")
    }


    const existingUser = await User.findOne({
        email
    })

    if(existingUser)
    {
        throw new ApiError(400,"User already exists with same email")      
    }

    const user = await User.create({
        name,
        email,
        password,
    });
  
    //Excludes password and refreshToken from response.....
    const createdUser = await User.findById(user._id).
    select("-password -refreshToken");

    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(new ApiResponse(201,{ user: createdUser}, "User registered successfully"));
})




const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password both are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password"); 
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password"); 
    }

    try {
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            );

    } catch (error) {
        
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
});


const getUser=asyncHandler(async(req,res)=>{
    return res.status(200).json({
        success:true,
        data:req.user
    });
});

const logoutUser = asyncHandler(async (req,res) => {

      await redis.del(`rt:${req.user._id}`);

    const options = {
        httpOnly : true,
        secure : true,
          sameSite: "None",
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,{},"User logged out")
    )
}) 

const updateAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        
        const storedToken=await redis.get(`rt:${decodedToken._id}`);


        if (!storedToken) {
            throw new ApiError(401, "Refresh token expired or user logged out");
        }
        

        if (storedToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "User not found");
        }


        const options = {
              httpOnly : true,
              secure : true,
              sameSite: "None",
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,{accessToken , refreshToken : newRefreshToken},"Access Token Refreshed")
        )

    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh token")
    }
})


const getAllFiles = asyncHandler(async (req,res) => {
    const userId = req.user._id.toString();
    const cacheKey=`files:${userId}`;

    const cached=await redis.get(cacheKey);
    if(cached){
        return res.status(200).json(
            new ApiResponse(200,JSON.parse(cached),"Files found successfully")
        );
    }

    const files = await File.find({ownerId : userId}).sort({createdAt : -1});

    await redis.set(cacheKey, JSON.stringify(files), "EX", 300);

    return res.status(200).json(
        new ApiResponse(200,files,"Files found successfully")
    )
})

export {
    generateAccessAndRefreshToken,
    registerUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getAllFiles,
    getUser
}