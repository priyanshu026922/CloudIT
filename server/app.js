import express from 'express'
import cors from 'cors' 
import cookieParser from 'cookie-parser'; 
import userRouter from './routes/user.routes.js';
import fileRouter from "./routes/file.routes.js";

const app = express(); 

// Enhanced CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    "http://localhost:3000",
    "http://localhost:5173", // Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json({
    limit : "16kb"
}))
app.use(express.urlencoded({
    extended : true, // object inside object
    limit : '16kb'
}))

app.use(cookieParser());

//route middlewares :
app.use('/api/v1/users' ,userRouter );
app.use('/api/v1/files' ,fileRouter );

export {
    app 
}