import ConversationRepository from "../repositories/conversationRepository.js"
import userRepository from "../repositories/userRepository.js"
import { ErrorResponse } from "../utils/response.js"

class ConversationService {
  async createConversation(myId, userId) {
    if (myId === userId) {
      throw new ErrorResponse(
        "You cannot create a conversation with yourself",
        400
      )
    }

    const user = await userRepository.findById(userId)
    if (!user) {
      throw new ErrorResponse("User not found", 404)
    }

    const existingConversation =
      await ConversationRepository.findByParticipants(myId, userId)

    if (existingConversation) {
      return existingConversation
    }

    const newConversation = await ConversationRepository.create(myId, userId)
    return newConversation
  }

  async getConversations(userId) {
    const conversations = await ConversationRepository.findByUserId(userId)
    return conversations
  }
}

export default new ConversationService()
