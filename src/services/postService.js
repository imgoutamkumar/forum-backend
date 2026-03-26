import prisma from "../config/prisma.js";

export const createPostService = async ({ userId, threadId, blocks }) => {
    try {
        const result = await prisma.$transaction(async (tx) => {

            // 1. Create Post
            const post = await tx.post.create({
                data: {
                    userId,
                    threadId
                }
            });

            // 2. Create blocks
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];

                //  FIRST create PostBlock
                const createdBlock = await tx.postBlock.create({
                    data: {
                        postId: post.id,
                        type: block.type,
                        content: block.content || null,
                        order: i
                    }
                });

                //  THEN create media (if any)
                if (block.media && block.media.length > 0) {
                    for (const media of block.media) {
                        await tx.media.create({
                            data: {
                                url: media.url,
                                type: media.type,
                                blockId: createdBlock.id
                            }
                        });
                    }
                }
            }
            return post;
        });

        await tx.thread.update({
            where: { id: threadId },
            data: {
                lastPostId: post.id,
                lastActivityAt: new Date()
            }
        });

        return {
            success: true,
            post: result
        };

    } catch (error) {
        console.error('Create post error:', error);
        throw new Error('Failed to create post');
    }
};

export const getPostsByThread = async ({ threadId, page = 1, limit = 10 }) => {
    
    const skip = (page - 1) * limit;
    const posts = await prisma.post.findMany({
        where: {
            threadId
        },
        skip,
        take: limit,

        orderBy: {
            createdAt: 'desc' // latest posts first
        },

        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            },

            blocks: {
                orderBy: {
                    order: 'asc'
                },
                include: {
                    media: true // include all media for each block
                }
            },

            _count: {
                select: {
                    likes: true
                }
            }
        }
    });

    // Total posts count (for pagination)
    const total = await prisma.post.count({
        where: { threadId }
    });

    return {
        posts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};