import express from 'express'
import cors from 'cors' 
import cookieParser from 'cookie-parser'; 
import userRouter from './routes/user.routes.js';
import fileRouter from "./routes/file.routes.js";
import shareRoutes from "./routes/share.routes.js";
import { rateLimitIP } from "./middleware/rateLimiter.js";

import notificationRoutes from "./routes/notification.routes.js";

const app = express(); 


app.use(rateLimitIP);

app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json({
    limit : "16kb"    
}))


app.use(express.urlencoded({
    extended : true,
    limit : '16kb'
}))

app.use(cookieParser());

app.use('/api/v1/users' ,userRouter );
app.use('/api/v1/files' ,fileRouter );
app.use("/api/v1/files", shareRoutes);
app.use("/api/v1/notifications", notificationRoutes);

export {
    app 
}