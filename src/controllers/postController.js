import { uploadFile } from "../config/cloudinary.js";
import { createPostService, getPostsByThread } from "../services/postService.js";
import { getThreadById } from "../services/threadService.js";


export const createPost = async (req, res) => {
    try {
        const { threadId, blocks } = req.body;
        const userId = req.userId;

        if (!threadId || !blocks || !blocks.length) {
            return res.status(400).json({
                message: 'Invalid request'
            });
        }

        //Check if thread exists
        const thread = await getThreadById(threadId)
        if (!thread) {
            return res.status(400).json({
                success: false,
                message: 'thread does not exist'
            });
        }

        // Parse blocks (comes as string from FormData)
        let parsedBlocks;

        try {
            parsedBlocks = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;
        } catch (err) {
            return res.status(400).json({ message: 'Invalid blocks format' });
        }

        if (!threadId || !parsedBlocks || !parsedBlocks.length) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        // Uploaded files
        // const files = req.files;
        const fileMap = {};
        console.log(req.files)
        for (const file of req.files) {
            if (!fileMap[file.fieldname]) {
                fileMap[file.fieldname] = [];
            }
            fileMap[file.fieldname].push(file);
        }

        for (let i = 0; i < parsedBlocks.length; i++) {
            const block = parsedBlocks[i];

            if (block.type !== 'TEXT') {
                const key = `block_${i}`;

                const files = fileMap[key] || [];

                if (files.length > 0) {
                    block.media = [];

                    for (const file of files) {
                        const uploadResult = await uploadFile(file, `thread/${threadId}`);

                        block.media.push({
                            url: uploadResult.secure_url,
                            type: block.type,
                            publicId: uploadResult.publicId
                        });
                    }
                }
            }
        }

        const result = await createPostService({
            userId,
            threadId,
            blocks: parsedBlocks
        });

        return res.status(201).json({
            message: 'Post created successfully',
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Something went wrong'
        });
    }
};



export const getPostsByThreadId = async (req, res) => {
    try {
        const { threadId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        if (limit > 50) limit = 50;

        // page = Number(page) || 1;
        // limit = Number(limit) || 10;

        const thread = await getThreadById(threadId);
        if (!thread) {
            throw new Error('Thread not found');
        }


        const result = await getPostsByThread({
            threadId,
            page: Number(page),
            limit: Number(limit)
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Something went wrong'
        });
    }
};