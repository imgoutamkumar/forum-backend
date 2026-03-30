import prisma from "../config/prisma.js";

// Create comment
export const createReplyService = (CommentId, userId, content) => {
    return prisma.reply.create({
        data: {
            CommentId,
            userId,
            content,
        },
    });
}