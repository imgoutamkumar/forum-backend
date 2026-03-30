import { createReplyService } from "../services/ReplyService";

export const createReply = async (req, res) => {
  try {
    const { commentId, content } = req.body;
    const userId = req.userId; // assuming auth middleware

    const reply = await createReplyService(
      commentId,
      userId,
      content
    );

    res.status(201).json(reply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}