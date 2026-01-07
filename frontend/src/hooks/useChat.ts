import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import api from "@/lib/api"
import type { User } from "./useAuth"
import { useSocket } from "@/components/providers/SocketContext"

export interface Message {
  _id: string
  sender: User
  content: string
  createdAt: string
  isRead: boolean
  conversationId: string
}

export interface Conversation {
  _id: string
  participants: User[]
  lastMessage?: Message
  updatedAt: string
  unreadCount: Record<string, number>
}

interface ConversationsResponse {
  success: boolean
  message: string
  data: {
    conversations: Conversation[]
  }
}

export function useChat() {
  const queryClient = useQueryClient()
  const { onNewMessage } = useSocket()
  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get<ConversationsResponse>("/conversations")
      return res.data.data.conversations
    },
  })

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Update messages cache
      queryClient.setQueryData<Message[]>(
        ["messages", message.conversationId],
        (old) => {
          if (!old) return [message]
          // Avoid duplicates
          const exists = old.find((m) => m._id === message._id)
          if (exists) return old
          return [...old, message]
        }
      )

      // Update conversation list
      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) return old
        return old
          .map((c) => {
            if (c._id === message.conversationId) {
              return {
                ...c,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
            }
            return c
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      })
    }

    onNewMessage(handleNewMessage)

    // Cleanup listener on unmount
    return () => {
      // Socket.io will handle cleanup when component unmounts
    }
  }, [onNewMessage, queryClient])

  // Search users hook
  const useSearchUsers = (query: string) => {
    return useQuery({
      queryKey: ["users", query],
      queryFn: async () => {
        const res = await api.get<{ data: { users: User[] } }>(
          `/users?username=${query}`
        )
        return res.data.data.users
      },
      enabled: query.length >= 2,
    })
  }

  // Create conversation hook
  const createConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post<{ data: { newConversation: Conversation } }>(
        "/conversation",
        { userId }
      )
      return res.data.data.newConversation
    },
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) return [newConversation]
        // Check if exists
        const exists = old.find((c) => c._id === newConversation._id)
        if (exists) return old
        return [newConversation, ...old]
      })
    },
  })

  // Messages hook
  const useMessages = (conversationId: string | null) => {
    return useQuery({
      queryKey: ["messages", conversationId],
      queryFn: async () => {
        if (!conversationId) return []
        const res = await api.get<{ data: { messages: Message[] } }>(
          `/messages/${conversationId}`
        )
        return res.data.data.messages
      },
      enabled: !!conversationId,
    })
  }

  // Send message hook
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) => {
      const res = await api.post<{ data: { newMessage: Message } }>(
        "/messages",
        { conversationId, content }
      )
      return res.data.data.newMessage
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(
        ["messages", newMessage.conversationId],
        (old) => [...(old || []), newMessage]
      )

      // Update last message in conversation list
      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) return old
        return old
          .map((c) => {
            if (c._id === newMessage.conversationId) {
              return {
                ...c,
                lastMessage: newMessage,
                updatedAt: newMessage.createdAt,
              }
            }
            return c
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      })
    },
  })

  return {
    conversations,
    isLoading,
    error,
    useSearchUsers,
    createConversation: createConversationMutation,
    useMessages,
    sendMessage: sendMessageMutation,
  }
}
