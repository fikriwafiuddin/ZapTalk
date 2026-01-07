import { ErrorResponse } from "../utils/response.js"

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ErrorResponse) {
    return res
      .status(err.status)
      .json(new ErrorResponse(err.message, err.status, err.errors, err.data))
  }

  console.log("Error in errorMiddleware function", new Date(), err)
  return res.status(500).json(new ErrorResponse("Internal server error"))
}

export default errorMiddleware
