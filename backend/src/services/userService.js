import UserRepository from "../repositories/userRepository.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { ErrorResponse } from "../utils/response.js"

class UserService {
  async searchUsers(username) {
    if (!username) return []
    const users = await UserRepository.searchUsers(username)
    return users
  }

  async updateProfile(userId, { username, image, deletePhotoProfile }) {
    const user = await UserRepository.findByIdFull(userId)
    if (!user) throw new ErrorResponse("User not found", 404)

    if (!username) throw new ErrorResponse("Username is required", 400)

    const updateData = { username }

    if (user.photoProfile && (deletePhotoProfile === "true" || image)) {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const imagePath = path.join(__dirname, "../../images", user.photoProfile)

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }

      if (deletePhotoProfile === "true") {
        updateData.photoProfile = null
      }
    }

    if (image) {
      updateData.photoProfile = image.filename
    }

    const updatedUser = await UserRepository.updateUser(userId, updateData)
    return updatedUser
  }
}

export default new UserService()
