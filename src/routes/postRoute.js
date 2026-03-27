import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createPost, getPostsByThreadId, updatePost } from "../controllers/postController.js";
import { upload } from "../config/multer.js";

const postRoute = Router()

postRoute.post("/create", authMiddleware, upload.any(), createPost)
postRoute.get("/thread/:threadId", authMiddleware, getPostsByThreadId)
postRoute.put("/update/:threadId", authMiddleware, upload.any(), updatePost)

export default postRoute;