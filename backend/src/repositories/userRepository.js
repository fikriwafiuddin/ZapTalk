import User from "../models/userModel.js"

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email })
  }

  async findById(id) {
    return await User.findById(id).select("-password") // Default select minus password, can be overridden if needed but usually we don't return password
  }

  // Helper specifically for internal logic needing password, if distinct from general findById
  async findByIdWithPassword(id) {
    return await User.findById(id)
  }

  async createUser(userData) {
    return await User.create(userData)
  }

  async searchUsers(username) {
    return await User.find({
      username: { $regex: username, $options: "i" },
    })
      .select("username email photoProfile")
      .limit(10)
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      "-password"
    )
  }

  async findByIdFull(id) {
    return await User.findById(id)
  }
}

export default new UserRepository()
