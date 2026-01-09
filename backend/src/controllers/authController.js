import {
  loginValidator,
  registerValidator,
} from "../validators/authValidator.js"
import AuthService from "../services/authService.js"
import validation from "../validators/validation.js"
import { SuccessResponse } from "../utils/response.js"

export const register = async (req, res, next) => {
  const request = req.body
  try {
    const validatedRequest = validation(registerValidator, request)

    const { user, token } = await AuthService.registerUser(validatedRequest)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    return res.status(200).json(
      new SuccessResponse("Register successfull", {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          photoProfile: user.photoProfile,
        },
      })
    )
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  const request = req.body
  try {
    const validatedRequest = validation(loginValidator, request)

    const { user, token } = await AuthService.loginUser(validatedRequest)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json(
      new SuccessResponse("Login successfull", {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          photoProfile: user.photoProfile,
        },
      })
    )
  } catch (error) {
    next(error)
  }
}

export const verifyUser = async (req, res, next) => {
  const id = req.id
  try {
    const user = await AuthService.verifyUser(id)
    return res.status(200).json(
      new SuccessResponse("Verify successfull", {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          photoProfile: user.photoProfile,
        },
      })
    )
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  })
  return res.status(200).json(new SuccessResponse("Logout successfull"))
}
