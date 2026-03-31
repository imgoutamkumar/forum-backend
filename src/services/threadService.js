import prisma from "../config/prisma.js";

export const createThreadService = async ({
    title,
    blocks, // array of blocks
    userId,
    categoryId
}) => {
    try {
        const slugify = (text) =>
            text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

        const baseSlug = slugify(title);

        let slug = baseSlug;
        let counter = 1;

        while (await prisma.thread.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        const result = await prisma.$transaction(async (tx) => {

            // 1. Create Thread
            const thread = await tx.thread.create({
                data: {
                    title,
                    slug,
                    userId,
                    categoryId
                }
            });

            // 2. Create First Post
            const post = await tx.post.create({
                data: {
                    threadId: thread.id,
                    userId
                }
            });

            // 3. Create Blocks
            if (blocks && Array.isArray(blocks)) {
                let order = 1;
                for (const block of blocks) {
                    const createdBlock = await tx.postBlock.create({
                        data: {
                            postId: post.id,
                            type: block.type,
                            content: block.content,
                            order: order
                        }
                    });

                    // 4. Handle Media Blocks
                    if (
                        (block.type === 'IMAGE' || block.type === 'VIDEO') &&
                        block.media &&
                        block.media.length > 0
                    ) {
                        for (const media of block.media) {
                            await tx.media.create({
                                data: {
                                    url: media.url,
                                    publicId: media.publicId,
                                    type: block.type,
                                    blockId: createdBlock.id
                                }
                            });
                        }
                    }

                    order++;
                }
            }

            await tx.thread.update({
                where: { id: thread.id },
                data: {
                    lastPostId: post.id,
                    lastActivityAt: new Date()
                }
            });

            return thread;
        });


        return result;

    } catch (error) {
        console.error('Create thread error:', error);
        throw new Error('Failed to create thread');
    }
};


export const getThreadById = async (threadId) => {
    const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        select: { id: true }
    });
    return thread;
};

export const getAllThreadsService = async ({ page = 1, limit = 10, search = '' }) => {
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    if (limit > 50) limit = 50; // max limit to prevent abuse

    const skip = (page - 1) * limit;

    // Build dynamic filter
    const where = search
        ? {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive' // case-insensitive search
                    }
                },
                {
                    user: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ]
        }
        : {};

    // Fetch threads with only required fields
    const threads = await prisma.thread.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            lastActivityAt: 'desc' // show most active threads first
        },
        select: {
            id: true,
            title: true,
            views: true,
            isLocked: true,
            isPinned: true,
            lastPostId: true,
            lastActivityAt: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            }
        }
    });

    // Total count for pagination
    const total = await prisma.thread.count();

    return {
        threads,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};