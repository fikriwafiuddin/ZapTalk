import Conversation from "../models/conversationModel.js"

class ConversationRepository {
  async findByParticipants(userId1, userId2) {
    return await Conversation.findOne({
      participants: { $all: [userId1, userId2] },
    })
  }

  async create(userId1, userId2) {
    return await Conversation.create({
      participants: [userId1, userId2],
    })
  }

  async findByUserId(userId) {
    return await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "username email photoProfile")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
  }
}

export default new ConversationRepository()
