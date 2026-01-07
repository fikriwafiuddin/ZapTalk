import { ErrorResponse } from "../utils/response.js"

const validation = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false })
  if (error) {
    const errors = {}
    error.details.map((detail) => (errors[detail.path] = detail.message))
    throw new ErrorResponse("Error validator", 400, errors)
  }
  return value
}

export default validation
