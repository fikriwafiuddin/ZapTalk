import express from "express"
import {
  verifyUser,
  login,
  register,
  logout,
} from "./controllers/authController.js"
import verifyToken from "./middlewares/verifyToken.js"
import {
  createConversation,
  getConversations,
} from "./controllers/conversationController.js"
import upload from "./middlewares/multer.js"
import { searchUsersByUsername } from "./controllers/userController.js"
import { sendMessage, getMessages } from "./controllers/messageController.js"
import errorMiddleware from "./middlewares/errorMiddleware.js"

const route = express()

route.post("/auth/register", register)
route.post("/auth/login", login)
route.get("/auth/verifyUser", verifyToken, verifyUser)
route.get("/auth/logout", verifyToken, logout)
// route.patch("/auth/editProfile", verifyToken, upload, editProfile)

route.post("/conversation", verifyToken, createConversation)
route.get("/conversations", verifyToken, getConversations)

route.get("/users", verifyToken, searchUsersByUsername)

route.post("/messages", verifyToken, sendMessage)
route.get("/messages/:conversationId", verifyToken, getMessages)

route.use(errorMiddleware)

export default route
