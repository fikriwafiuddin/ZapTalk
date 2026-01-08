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

    const io = getIO()
    const receiverSocketId = getReceiverSocketId(receiverId?.toString())
    let isRead = false
    let isDelivered = false
    let deliveredAt = null

    if (receiverSocketId) {
      isDelivered = true
      deliveredAt = new Date()

      const receiverSocket = io.sockets.sockets.get(receiverSocketId)
      if (
        receiverSocket &&
        receiverSocket.rooms.has(conversationId.toString())
      ) {
        isRead = true
      }
    }

    if (isRead) {
      await newMessage.updateOne({
        isRead: true,
        isDelivered: true,
        deliveredAt: new Date(),
      })
      newMessage.isRead = true
      newMessage.isDelivered = true
    } else if (isDelivered) {
      await newMessage.updateOne({ isDelivered: true, deliveredAt })
      newMessage.isDelivered = true
    }

    // Update conversation last message
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: newMessage._id,
        lastMessageAt: newMessage.createdAt,
        [`unreadCount.${senderId}`]: 0,
        ...(isRead
          ? { [`unreadCount.${receiverId}`]: 0 }
          : { $inc: { [`unreadCount.${receiverId}`]: 1 } }),
      },
      { new: true }
    )

    const populatedMessage = await newMessage.populate(
      "sender",
      "username email photoProfile"
    )

    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId.toString())
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", populatedMessage)
        io.to(receiverSocketId).emit("unreadCountUpdate", {
          conversationId: updatedConversation._id,
          unreadCount: updatedConversation.unreadCount,
        })
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

    // Reset unread count for current user
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        [`unreadCount.${userId}`]: 0,
      },
      { new: true }
    )

    // Mark messages as read
    await MessageRepository.markAsRead(conversationId, userId)

    const io = getIO()

    // Emit messagesRead to the sender of the messages
    // This assumes a 1-on-1 chat where the sender is the "other" person
    const otherParticipantId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    )
    if (otherParticipantId) {
      const otherSocketId = getReceiverSocketId(otherParticipantId.toString())
      if (otherSocketId) {
        io.to(otherSocketId).emit("messagesRead", {
          conversationId,
          readBy: userId,
        })
      }
    }
    const currentSocketId = getReceiverSocketId(userId.toString())
    if (currentSocketId) {
      io.to(currentSocketId).emit("unreadCountUpdate", {
        conversationId: updatedConversation._id,
        unreadCount: updatedConversation.unreadCount,
      })
    }

    const messages = await MessageRepository.findByConversationId(
      conversationId
    )
    return messages
  }

  async markMessagesAsDelivered(userId) {
    // 1. Get all conversations the user is in
    const conversations = await Conversation.find({ participants: userId })
    const conversationIds = conversations.map((c) => c._id)

    // 2. Mark messages as delivered in the repo
    await MessageRepository.markAsDeliveredToUser(userId, conversationIds)

    // 3. Notify senders
    const io = getIO()
    conversations.forEach((conv) => {
      const otherParticipantId = conv.participants.find(
        (p) => p.toString() !== userId.toString()
      )
      if (otherParticipantId) {
        const otherSocketId = getReceiverSocketId(otherParticipantId.toString())
        if (otherSocketId) {
          io.to(otherSocketId).emit("messagesDelivered", {
            conversationId: conv._id,
            deliveredTo: userId,
          })
        }
      }
    })
  }
}

export default new MessageService()
