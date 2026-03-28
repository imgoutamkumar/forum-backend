import { createCategoryService, getAllCategoryService } from "../services/categoryService.js"

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            })
        }

        const category = await createCategoryService({
            name,
            description
        })

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        })

    } catch (error) {
        console.error(error)

        if (error.message === "Category already exists") {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

export const getAllCategory = async (req, res) => {
    try {
        const categories = await getAllCategoryService();

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        });

    } catch (error) {
        console.error("Error fetching categories:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};