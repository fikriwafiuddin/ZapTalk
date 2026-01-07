import ConversationService from "../services/conversationService.js"
import { SuccessResponse } from "../utils/response.js"

export const createConversation = async (req, res, next) => {
  const { userId } = req.body
  const myId = req.id
  try {
    const newConversation = await ConversationService.createConversation(
      myId,
      userId
    )
    return res.status(200).json(
      new SuccessResponse("Conversation created successfully", {
        newConversation,
      })
    )
  } catch (error) {
    next(error)
  }
}

export const getConversations = async (req, res, next) => {
  const id = req.id
  try {
    const conversations = await ConversationService.getConversations(id)

    return res
      .status(200)
      .json(new SuccessResponse("Conversations found", { conversations }))
  } catch (error) {
    next(error)
  }
}
