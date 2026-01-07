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
}

export default new MessageRepository()
