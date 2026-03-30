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