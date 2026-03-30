import prisma from "../config/prisma.js";

// Create comment
export const createReplyService = (commentId, userId, content) => {
    return prisma.reply.create({
        data: {
            commentId,
            userId,
            content,
        }
    });
}