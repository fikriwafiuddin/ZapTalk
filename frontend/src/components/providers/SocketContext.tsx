import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface SocketContextType {
  socket: Socket | null
  onlineUsers: string[]
  onNewMessage: (callback: (message: any) => void) => (() => void) | undefined
  onUnreadCountUpdate: (
    callback: (data: {
      conversationId: string
      unreadCount: Record<string, number>
    }) => void
  ) => (() => void) | undefined
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  onMessagesDelivered: (
    callback: (data: { conversationId: string; deliveredTo: string }) => void
  ) => (() => void) | undefined
  onMessagesRead: (
    callback: (data: { conversationId: string; readBy: string }) => void
  ) => (() => void) | undefined
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider")
  }
  return context
}

export const SocketContextProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000", {
        query: {
          userId: user._id,
        },
      })

      setSocket(newSocket)

      newSocket.on("getOnlineUsers", (users: string[]) => {
        setOnlineUsers(users)
      })

      return () => {
        newSocket.close()
        setSocket(null)
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [user])

  useEffect(() => {
    if (!socket) return

    const handleNewMessageNotification = (message: any) => {
      // Get conversation ID from URL
      const searchParams = new URLSearchParams(window.location.search)
      const selectedId = searchParams.get("id")

      // Show toast if not in the conversation and not the sender
      if (
        message.conversationId !== selectedId &&
        message.sender._id !== user?._id
      ) {
        toast(message.sender.username, {
          description: message.content,
        })
      }
    }

    socket.on("newMessage", handleNewMessageNotification)
    return () => {
      socket.off("newMessage", handleNewMessageNotification)
    }
  }, [socket, user])

  const onNewMessage = useCallback(
    (callback: (message: any) => void) => {
      if (socket) {
        socket.on("newMessage", callback)
        return () => {
          socket.off("newMessage", callback)
        }
      }
    },
    [socket]
  )

  const onUnreadCountUpdate = useCallback(
    (
      callback: (data: {
        conversationId: string
        unreadCount: Record<string, number>
      }) => void
    ) => {
      if (socket) {
        socket.on("unreadCountUpdate", callback)
        return () => {
          socket.off("unreadCountUpdate", callback)
        }
      }
    },
    [socket]
  )

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit("joinConversation", conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit("leaveConversation", conversationId)
    }
  }

  const onMessagesDelivered = useCallback(
    (
      callback: (data: { conversationId: string; deliveredTo: string }) => void
    ) => {
      if (socket) {
        socket.on("messagesDelivered", callback)
        return () => {
          socket.off("messagesDelivered", callback)
        }
      }
    },
    [socket]
  )

  const onMessagesRead = useCallback(
    (callback: (data: { conversationId: string; readBy: string }) => void) => {
      if (socket) {
        socket.on("messagesRead", callback)
        return () => {
          socket.off("messagesRead", callback)
        }
      }
    },
    [socket]
  )

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        onNewMessage,
        onUnreadCountUpdate,
        joinConversation,
        leaveConversation,
        onMessagesDelivered,
        onMessagesRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
