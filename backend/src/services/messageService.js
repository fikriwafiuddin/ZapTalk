import MessageRepository from "../repositories/messageRepository.js"
import Conversation from "../models/conversationModel.js"
import { ErrorResponse } from "../utils/response.js"
import { getIO, getReceiverSocketId } from "../utils/socketManager.js"

class MessageService {
  async sendMessage(senderId, conversationId, content) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      throw new ErrorResponse("Conversation not found", 404)
    }

    if (!conversation.participants.includes(senderId)) {
      throw new ErrorResponse(
        "You are not a participant in this conversation",
        403
      )
    }

    const newMessage = await MessageRepository.create({
      sender: senderId,
      conversationId,
      content,
    })

    const receiverId = conversation.participants.find(
      (id) => id.toString() !== senderId.toString()
    )

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      lastMessageAt: newMessage.createdAt,
      [`unreadCount.${senderId}`]: 0,
      $inc: { [`unreadCount.${receiverId}`]: 1 },
    })

    const populatedMessage = await newMessage.populate(
      "sender",
      "username email photoProfile"
    )

    const io = getIO()

    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString())
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage)
      }
    }

    return populatedMessage
  }

  async getMessages(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      throw new ErrorResponse("Conversation not found", 404)
    }

    if (!conversation.participants.includes(userId)) {
      throw new ErrorResponse(
        "You are not a participant in this conversation",
        403
      )
    }

    const messages = await MessageRepository.findByConversationId(
      conversationId
    )
    return messages
  }
}

export default new MessageService()
