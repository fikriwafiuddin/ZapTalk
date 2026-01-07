import User from "../models/userModel.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import userService from "../services/userService.js"
import { SuccessResponse } from "../utils/response.js"

export const editProfile = async (req, res) => {
  const id = req.id
  const image = req.file
  const { username, deletePhotoProfile } = req.body
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (username == "")
      return res.status(400).json({ message: "Username is required" })
    user.username = username

    if (user.photoProfile && deletePhotoProfile === "true") {
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)
      const imagePath = path.join(__dirname, "../../images", user.photoProfile)
      fs.unlinkSync(imagePath)
      user.photoProfile = null
    }

    if (image) {
      user.photoProfile = image.filename
    }

    const editedUser = await user.save()
    return res
      .status(200)
      .json({ message: "Profile edited successfully", user: editedUser })
  } catch (error) {
    console.log("Error in editProfile function", new Date(), error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

export const searchUsersByUsername = async (req, res, next) => {
  const { username } = req.query

  try {
    const users = await userService.searchUsers(username)
    if (users.length === 0) {
      throw new ErrorResponse("No users found", 404)
    }

    return res.status(200).json(new SuccessResponse("Users found", { users }))
  } catch (error) {
    next(error)
  }
}
