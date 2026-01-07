import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/hooks/useAuth"

interface SocketContextType {
  socket: Socket | null
  onlineUsers: string[]
  onNewMessage: (callback: (message: any) => void) => void
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

  const onNewMessage = (callback: (message: any) => void) => {
    if (socket) {
      socket.on("newMessage", callback)
    }
  }

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, onNewMessage }}>
      {children}
    </SocketContext.Provider>
  )
}
