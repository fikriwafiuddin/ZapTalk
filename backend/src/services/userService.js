import UserRepository from "../repositories/userRepository.js"

class UserService {
  async searchUsers(username) {
    if (!username) return []
    const users = await UserRepository.searchUsers(username)
    return users
  }
}

export default new UserService()
