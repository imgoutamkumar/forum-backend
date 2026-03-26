import { Router } from "express";
import { createCategory } from "../controllers/categoryController.js";

const categoryRoute = Router()

categoryRoute.post("/create",createCategory)

export default categoryRoute;