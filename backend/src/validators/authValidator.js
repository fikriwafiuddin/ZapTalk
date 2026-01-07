import Joi from "joi"

export const registerValidator = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Username must be a string.",
    "string.empty": "Username cannot be empty.",
    "string.alphanum": "Username can only contain letters and numbers.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username cannot exceed 30 characters.",
    "any.required": "Username is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email cannot be empty.",
    "string.email": "Email must be valid.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .min(8)
    .max(50)
    .required()
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#]).{8,}$")
    )
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password cannot be empty.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password cannot exceed 50 characters.",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "any.required": "Password is required.",
    }),
  confirmPassword: Joi.any().equal(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password.",
    "any.required": "Confirm password is required.",
  }),
})

export const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.empty": "Email cannot be empty.",
    "string.email": "Email must be valid.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(8).max(50).required().messages({
    "string.empty": "Password cannot be empty.",
    "any.required": "Password is required.",
  }),
})

export const formatJoiError = (error, payload) => {
  const errorDetails = error.details.map((detail) => ({
    field: detail.context.key,
    message: detail.message,
  }))

  const response = Object.keys(payload).reduce((acc, key) => {
    acc[key] = null
    return acc
  }, {})

  errorDetails.forEach((err) => {
    response[err.field] = err.message
  })

  return response
}
