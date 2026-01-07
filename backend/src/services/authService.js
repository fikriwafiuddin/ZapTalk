import bcrypt from "bcrypt"
import UserRepository from "../repositories/userRepository.js"
import generateToken from "../utils/generateToken.js"
import { ErrorResponse } from "../utils/response.js"

class AuthService {
  async registerUser({ username, email, password }) {
    const existingUser = await UserRepository.findByEmail(email)
    if (existingUser) {
      throw new ErrorResponse("This email is already exist", 400)
    }

    const hashPassword = bcrypt.hashSync(password, 10)

    const newUser = await UserRepository.createUser({
      username,
      email,
      password: hashPassword,
    })

    const token = generateToken(newUser._id)

    return { user: newUser, token }
  }

  async loginUser({ email, password }) {
    const user = await UserRepository.findByEmail(email)
    if (!user) {
      throw new ErrorResponse("Email or password is wrong", 400)
    }

    const comparePassword = await bcrypt.compare(password, user.password)
    if (!comparePassword) {
      throw new ErrorResponse("Email or password is wrong", 400)
    }

    const token = generateToken(user._id)

    return { user, token }
  }

  async verifyUser(id) {
    const user = await UserRepository.findById(id)
    if (!user) {
      throw new ErrorResponse("User not found", 404)
    }
    return user
  }
}

export default new AuthService()
