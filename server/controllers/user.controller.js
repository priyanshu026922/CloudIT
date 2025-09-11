import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js'; 
import jwt from 'jsonwebtoken'
import {File} from '../models/file.model.js'

const generateAccessAndRefreshToken = async (userId) => {
    
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generateAccessAndRefreshToken");
    }
}
 
const registerUser = asyncHandler(async (req,res) => {

    const {name,email,password} = req.body;

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

    // Input validation
    if (!email || !password) {
        throw new ApiError(400, "Email and password both are required"); // 400 instead of 401
    }

    // Validate email format (optional but good practice)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please provide a valid email address");
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password"); // Don't reveal if email exists
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password"); // Same message for security
    }

    try {
        // Generate tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Get user without sensitive data
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // Cookie options - adjust based on environment
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        console.error("Token generation error:", error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
});
const logoutUser = asyncHandler(async (req,res) => {

     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
           new : true
        });

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
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user)
        {
            throw new ApiError(401,"Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken)
        {
            throw new ApiError(401,"Refresh token is expired or used");
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
    const userId = req.user._id;

    const files = await File.find({ownerId : userId}).sort({createdAt : -1});

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
    getAllFiles
}