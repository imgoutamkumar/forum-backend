import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createPost, getPostsByThreadId } from "../controllers/postController.js";
import { upload } from "../config/multer.js";

const postRoute = Router()

postRoute.post("/create", authMiddleware, upload.any(), createPost)
postRoute.get("/thread/:threadId", authMiddleware, getPostsByThreadId)

export default postRoute;