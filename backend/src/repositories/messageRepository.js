import Message from "../models/messageModel.js"

class MessageRepository {
  async create(data) {
    return await Message.create(data)
  }

  async findByConversationId(conversationId) {
    return await Message.find({ conversationId })
      .populate("sender", "username email photoProfile")
      .sort({ createdAt: 1 })
  }

  async markAsRead(conversationId, userId) {
    return await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        isDelivered: true, // If it's read, it must be delivered
      }
    )
  }

  async markAsDeliveredToUser(userId, conversationIds) {
    return await Message.updateMany(
      {
        conversationId: { $in: conversationIds },
        sender: { $ne: userId },
        isDelivered: false,
      },
      {
        isDelivered: true,
        deliveredAt: new Date(),
      }
    )
  }
}

export default new MessageRepository()
