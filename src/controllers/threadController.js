import { uploadFile } from "../config/cloudinary.js";
import { createThreadService, getAllThreadsService } from "../services/threadService.js";

export const createThread = async (req, res) => {
    try {
        const { title, blocks, categoryId } = req.body;
        console.log("req.body:", req.body)
        const userId = req.userId;
        console.log("userId", userId)
        // Basic validation
        if (!title || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Title and categoryId are required'
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Parse content (blocks)
        let parsedBlocks;

        try {
            parsedBlocks = typeof blocks === 'string'
                ? JSON.parse(blocks)
                : blocks;
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blocks format'
            });
        }

        if (blocks && !Array.isArray(parsedBlocks)) {
            return res.status(400).json({
                success: false,
                message: 'blocks must be an array of blocks'
            });
        }

        // -------------------------------
        // FILE HANDLING (IMPORTANT PART)
        // -------------------------------
        const fileMap = {};

        if (req.files && req.files.length) {
            for (const file of req.files) {
                if (!fileMap[file.fieldname]) {
                    console.log("file.fieldname", file.fieldname)
                    fileMap[file.fieldname] = [];
                }
                fileMap[file.fieldname].push(file);
            }
        }

        // Attach uploaded files to blocks
        if (parsedBlocks && parsedBlocks.length) {
            for (let i = 0; i < parsedBlocks.length; i++) {
                const block = parsedBlocks[i];

                if (block.type !== 'TEXT') {
                    console.log("req.files", req.files)
                    const key = `block_${i}`;
                    const files = fileMap[key] || [];
                    console.log("files", files)
                    if (files.length > 0) {
                        block.media = [];

                        const uploadedFiles = []; // store publicIds

                        try {
                            for (const file of files) {
                                const uploadResult = await uploadFile(file, `thread/${Date.now()}`);
                                block.media.push({
                                    url: uploadResult.url,
                                    publicId: uploadResult.publicId,
                                    type: block.type,
                                });
                                uploadedFiles.push(uploadResult.publicId);
                            }
                        } catch (error) {
                            console.error("Upload failed, cleaning up:", error);
                            // delete already uploaded files
                            await Promise.all(uploadedFiles.map(id => deleteUploadedFile(id)));
                            throw new Error("FILE_UPLOAD_FAILED");
                        }
                    }
                }
            }
        }


        // Call service
        const thread = await createThreadService({
            title,
            blocks: parsedBlocks,
            userId,
            categoryId
        });

        return res.status(201).json({
            success: true,
            message: 'Thread created successfully',
            data: thread
        });

    } catch (error) {
        console.error('Create Thread Controller Error:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Something went wrong'
        });
    }
};

export const getAllThreads = async (req, res) => {
    try {
        const { page, limit, search } = req.query;

        const result = await getAllThreadsService({ page, limit, search });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get all threads error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Something went wrong'
        });
    }
};