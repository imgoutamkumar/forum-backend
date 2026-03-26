import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createThread, getAllThreads } from "../controllers/threadController.js";
import { upload } from "../config/multer.js";

const threadRoute = Router()

threadRoute.post("/create", authMiddleware, upload.any(), createThread)
threadRoute.get("/", authMiddleware, getAllThreads)
// threadRoute.get("/threads/:threadId", authMiddleware, getAllThreads)
// threadRoute.put("/threads/:threadId", authMiddleware, getAllThreads)
// threadRoute.delete("/threads/:threadId", authMiddleware, getAllThreads)


export default threadRoute;