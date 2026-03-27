import { deleteUploadedFile, uploadFile } from "../config/cloudinary.js";
import { createPostService, getPostsByThread, updatePostService } from "../services/postService.js";
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


export const updatePost = async (req, res) => {
  try {
    const { postId, threadId, blocks } = req.body;
    const userId = req.userId;

    if (!postId || !threadId || !blocks) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Check if thread exists
    const thread = await getThreadById(threadId);
    if (!thread) {
      return res.status(400).json({ message: 'Thread does not exist' });
    }

    // Parse blocks if string
    let parsedBlocks;
    try {
      parsedBlocks = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;
    } catch (err) {
      return res.status(400).json({ message: 'Invalid blocks format' });
    }

    if (!Array.isArray(parsedBlocks)) {
      return res.status(400).json({ message: 'blocks must be an array' });
    }

    // -------------------------------
    // FILE HANDLING
    // -------------------------------
    const fileMap = {};
    if (req.files && req.files.length) {
      for (const file of req.files) {
        if (!fileMap[file.fieldname]) fileMap[file.fieldname] = [];
        fileMap[file.fieldname].push(file);
      }
    }

    // Attach uploaded files to blocks
    for (let i = 0; i < parsedBlocks.length; i++) {
      const block = parsedBlocks[i];

      if (block.type !== 'TEXT') {
        const key = `block_${i}`;
        const files = fileMap[key] || [];
        if (files.length > 0) {
          if (!block.media) block.media = {};
          if (!block.media.new) block.media.new = [];

          const uploadedFiles = [];

          try {
            for (const file of files) {
              const uploadResult = await uploadFile(file, `thread/${Date.now()}`);
              block.media.new.push({
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                type: block.type,
              });
              uploadedFiles.push(uploadResult.publicId);
            }
          } catch (error) {
            console.error('Upload failed, cleaning up:', error);
            // Delete already uploaded files
            await Promise.all(uploadedFiles.map(id => deleteUploadedFile(id)));
            throw new Error('FILE_UPLOAD_FAILED');
          }
        }
      }
    }

    // Call service to update post
    const result = await updatePostService({
      postId,
      threadId,
      blocks: parsedBlocks,
    });

    return res.status(200).json({
      message: 'Post updated successfully',
      data: result,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};