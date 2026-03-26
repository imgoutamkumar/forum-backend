import prisma from "../config/prisma.js";

export const createCategoryService = async (data) => {

    const { name, description } = data
    try {
        const slugify = (text) =>
            text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

        const baseSlug = slugify(name);

        let slug = baseSlug;
        let counter = 1;

        while (await prisma.category.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`;
        }


        // Create category
        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description
            }
        })

        return category
    } catch (error) {
        console.error('Create category error:', error);
        throw new Error('Failed to create category');
    }

}