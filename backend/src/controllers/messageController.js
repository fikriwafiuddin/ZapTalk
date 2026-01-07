import MessageService from "../services/messageService.js"
import { SuccessResponse } from "../utils/response.js"

export const sendMessage = async (req, res, next) => {
  const { conversationId, content } = req.body
  const senderId = req.id

  try {
    const newMessage = await MessageService.sendMessage(
      senderId,
      conversationId,
      content
    )
    return res
      .status(201)
      .json(new SuccessResponse("Message sent successfully", { newMessage }))
  } catch (error) {
    next(error)
  }
}

export const getMessages = async (req, res, next) => {
  const { conversationId } = req.params
  const userId = req.id

  try {
    const messages = await MessageService.getMessages(conversationId, userId)
    return res
      .status(200)
      .json(new SuccessResponse("Messages found", { messages }))
  } catch (error) {
    next(error)
  }
}
