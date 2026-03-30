import { Router } from "express";
import { createComment, deleteComment, getByPostComment, updateComment } from "../controllers/commentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const commentRoute = Router()

commentRoute.post("/create", authMiddleware, createComment);
commentRoute.get("/post/:postId", authMiddleware, getByPostComment);
commentRoute.put("/:commentId", authMiddleware, updateComment);
commentRoute.delete("/:commentId", authMiddleware, deleteComment);

export default commentRoute;