import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from 'cors'
import authRoute from './routes/authRoute.js'
import threadRoute from "./routes/threadRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import postRoute from "./routes/postRoute.js";
import commentRoute from "./routes/commentRoute.js";
const app = express();
const allowedOrigins = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    "https://app.yourdomain.com"
];


dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use(cors())
app.use("/users", authRoute);
app.use("/threads", threadRoute);
app.use("/category",categoryRoute);
app.use("/posts",postRoute);
app.use("/comments", commentRoute);
app.use("/replies", replyRoute);

export default app;