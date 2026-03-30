import { Router } from "express";
import { createComment, deleteComment, getByPostComment, updateComment } from "../controllers/commentController";

const commentRoute = Router()

commentRoute.post("/create", createComment);
commentRoute.get("/post/:postId", getByPostComment);
commentRoute.put("/:commentId", updateComment);
commentRoute.delete("/:commentId", deleteComment);

export default commentRoute;