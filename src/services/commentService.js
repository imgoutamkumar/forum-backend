import prisma from "../config/prisma";


// Create comment
export const createCommentService = (postId, userId, content) => {
    return prisma.comment.create({
        data: {
            postId,
            userId,
            content,
        },
    });
}

// Get all comments for a post
export const getCommentsByPostService = async (postId) => {
    return prisma.comment.findMany({
        where: {
            postId,
            isDeleted: false,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            },
            replies: {
                where: { isDeleted: false },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

// Update comment
export const updateCommentService = async (commentId, userId, content) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment || comment.userId !== userId) {
        throw new Error("Unauthorized or comment not found");
    }

    return prisma.comment.update({
        where: { id: commentId },
        data: {
            content,
            isEdited: true,
        },
    });
}

// Soft delete comment
export const deleteCommentService = async (commentId, userId) => {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment || comment.userId !== userId) {
        throw new Error("Unauthorized or comment not found");
    }

    return prisma.comment.update({
        where: { id: commentId },
        data: {
            isDeleted: true,
        },
    });
}