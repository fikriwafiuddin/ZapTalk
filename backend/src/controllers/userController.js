import userService from "../services/userService.js"
import { SuccessResponse } from "../utils/response.js"

export const editProfile = async (req, res, next) => {
  const id = req.id
  const image = req.file
  const { username, deletePhotoProfile } = req.body

  try {
    const editedUser = await userService.updateProfile(id, {
      username,
      image,
      deletePhotoProfile,
    })

    return res.status(200).json(
      new SuccessResponse("Profile edited successfully", {
        user: editedUser,
      })
    )
  } catch (error) {
    next(error)
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
