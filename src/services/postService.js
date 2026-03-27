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
                                publicId: media.publicId,
                                type: media.type,
                                blockId: createdBlock.id
                            }
                        });
                    }
                }
            }

            await tx.thread.update({
                where: { id: threadId },
                data: {
                    lastPostId: post.id,
                    lastActivityAt: new Date()
                }
            });

            return post;
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
            createdAt: 'asc'
        },

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
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
            comments: {
                orderBy: { createdAt: 'asc' }, // optional, to show comments in order
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                    replies: {
                        orderBy: { createdAt: 'asc' }, // optional
                        include: {
                            user: { select: { id: true, name: true, avatar: true } },
                        },
                    },

                }
            },
            _count: { select: { likes: true } },
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

export const updatePostService = async ({ postId, threadId, blocks }) => {
    try {
        const result = await prisma.$transaction(async (tx) => {

            // 1. Get existing blocks
            const existingBlocks = await tx.postBlock.findMany({
                where: { postId },
                include: { media: true }
            });

            const existingBlockMap = new Map(
                existingBlocks.map((b) => [b.id, b])
            );

            const incomingBlockIds = blocks
                .filter((b) => b.id)
                .map((b) => b.id);

            // 2. DELETE removed blocks
            for (const block of existingBlocks) {
                if (!incomingBlockIds.includes(block.id)) {
                    await tx.media.deleteMany({
                        where: { blockId: block.id }
                    });

                    await tx.postBlock.delete({
                        where: { id: block.id }
                    });
                }
            }

            // 3. UPSERT blocks
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];

                // 👉 UPDATE existing block
                if (block.id && existingBlockMap.has(block.id)) {
                    await tx.postBlock.update({
                        where: { id: block.id },
                        data: {
                            type: block.type,
                            content: block.content || null,
                            order: i
                        }
                    });

                    // ---- MEDIA HANDLING ----
                    const existingMedia = existingBlockMap.get(block.id).media;

                    const existingMediaIds = existingMedia.map((m) => m.id);
                    const incomingExistingIds =
                        block.media?.existing?.map((m) => m.id) || [];

                    // DELETE removed media
                    await tx.media.deleteMany({
                        where: {
                            id: {
                                in: existingMediaIds.filter(
                                    (id) => !incomingExistingIds.includes(id)
                                )
                            }
                        }
                    });

                    // ADD new media
                    if (block.media?.new?.length) {
                        for (const media of block.media.new) {
                            await tx.media.create({
                                data: {
                                    url: media.url,
                                    publicId: media.publicId,
                                    type: media.type,
                                    blockId: block.id
                                }
                            });
                        }
                    }

                } else {
                    // 👉 CREATE new block
                    const createdBlock = await tx.postBlock.create({
                        data: {
                            postId,
                            type: block.type,
                            content: block.content || null,
                            order: i
                        }
                    });

                    // ADD media
                    if (block.media.new && block.media.new.length > 0) {
                        for (const media of block.media.new) {
                            await tx.media.create({
                                data: {
                                    url: media.url,
                                    publicId: media.publicId,
                                    type: media.type,
                                    blockId: createdBlock.id
                                }
                            });
                        }
                    }
                }
            }

            // 4. Update thread activity
            await tx.thread.update({
                where: { id: threadId },
                data: {
                    lastActivityAt: new Date()
                }
            });

            return { success: true };
        });

        return result;

    } catch (error) {
        console.error("Update post error:", error);
        throw new Error("Failed to update post");
    }
};