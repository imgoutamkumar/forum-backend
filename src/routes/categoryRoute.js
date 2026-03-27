import { Router } from "express";
import { createCategory, getAllCategory } from "../controllers/categoryController.js";

const categoryRoute = Router()

categoryRoute.post("/create",createCategory)
categoryRoute.get("/all",getAllCategory)

export default categoryRoute;