import { Server } from "socket.io"
import messageService from "../services/messageService.js"

let io = null
const onlineUsers = new Map()

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    },
  })

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id)
    const userId = socket.handshake.query.userId

    if (userId) {
      onlineUsers.set(userId, socket.id)
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()))

      // Mark messages as delivered when user comes online
      messageService.markMessagesAsDelivered(userId)
    }

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId)
      console.log(`User ${userId} joined room: ${conversationId}`)
    })

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId)
      console.log(`User ${userId} left room: ${conversationId}`)
    })

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id)
      if (userId) {
        onlineUsers.delete(userId)
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()))
      }
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!")
  }
  return io
}

export const getReceiverSocketId = (userId) => {
  return onlineUsers.get(userId)
}

export { onlineUsers }
