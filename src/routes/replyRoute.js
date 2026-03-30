import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createReply } from "../controllers/replyController.js";

const replyRoute = Router()

replyRoute.post("/create", authMiddleware, createReply);

export default replyRoute;