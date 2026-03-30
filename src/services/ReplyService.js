import prisma from "../config/prisma";

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