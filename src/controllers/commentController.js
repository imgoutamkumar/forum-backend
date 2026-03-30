import { createCommentService, deleteCommentService, getCommentsByPostService, updateCommentService } from "../services/commentService.js";


  // Create comment
  export const createComment=async(req, res) =>{
    try {
      const { postId, content } = req.body;
      const userId = req.userId; // assuming auth middleware

      const comment = await createCommentService(
        postId,
        userId,
        content
      );

      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Get comments for a post
 export const getByPostComment=async(req, res) =>{
    try {
      const { postId } = req.params;

      const comments = await getCommentsByPostService(postId);

      return res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update comment
  export const updateComment= async(req, res)=> {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
       const userId = req.userId;

      const updated = await updateCommentService(
        commentId,
        userId,
        content
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete comment
  export const deleteComment=async(req, res) =>{
    try {
      const { commentId } = req.params;
       const userId = req.userId;

      const deleted = await deleteCommentService(
        commentId,
        userId
      );

      res.json({ message: "Comment deleted", deleted });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }