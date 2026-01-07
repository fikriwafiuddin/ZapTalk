import { Server } from "socket.io"

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
    }

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
