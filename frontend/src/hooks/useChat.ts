import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import api from "@/lib/api"
import type { User } from "./useAuth"
import { useSocket } from "@/components/providers/SocketContext"

export interface Message {
  _id: string
  sender: User
  content: string
  createdAt: string
  isRead: boolean
  isDelivered?: boolean
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
  const [searchParams] = useSearchParams()
  const selectedId = searchParams.get("id")
  const {
    onNewMessage,
    onUnreadCountUpdate,
    joinConversation,
    leaveConversation,
    onMessagesDelivered,
    onMessagesRead,
  } = useSocket()
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

  // Handle room joining/leaving
  useEffect(() => {
    if (selectedId) {
      joinConversation(selectedId)
      return () => {
        leaveConversation(selectedId)
      }
    }
  }, [joinConversation, leaveConversation, selectedId])

  // Handle message delivery/read status updates
  useEffect(() => {
    const handleDelivered = (data: {
      conversationId: string
      deliveredTo: string
    }) => {
      // Update individual messages
      queryClient.setQueryData<Message[]>(
        ["messages", data.conversationId],
        (old) => {
          if (!old) return old
          return old.map((m) => {
            if (m.sender._id !== data.deliveredTo && !m.isDelivered) {
              return { ...m, isDelivered: true }
            }
            return m
          })
        }
      )

      // Update conversations (sidebar)
      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) return old
        return old.map((conv) => {
          if (
            conv._id === data.conversationId &&
            conv.lastMessage &&
            conv.lastMessage.sender._id !== data.deliveredTo &&
            !conv.lastMessage.isDelivered
          ) {
            return {
              ...conv,
              lastMessage: { ...conv.lastMessage, isDelivered: true },
            }
          }
          return conv
        })
      })
    }

    const handleRead = (data: { conversationId: string; readBy: string }) => {
      // Update individual messages
      queryClient.setQueryData<Message[]>(
        ["messages", data.conversationId],
        (old) => {
          if (!old) return old
          return old.map((m) => {
            if (m.sender._id !== data.readBy && !m.isRead) {
              return { ...m, isRead: true, isDelivered: true }
            }
            return m
          })
        }
      )

      // Update conversations (sidebar)
      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) return old
        return old.map((conv) => {
          if (
            conv._id === data.conversationId &&
            conv.lastMessage &&
            conv.lastMessage.sender._id !== data.readBy &&
            !conv.lastMessage.isRead
          ) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                isRead: true,
                isDelivered: true,
              },
            }
          }
          return conv
        })
      })
    }

    const cleanupDelivered = onMessagesDelivered(handleDelivered)
    const cleanupRead = onMessagesRead(handleRead)

    return () => {
      cleanupDelivered?.()
      cleanupRead?.()
    }
  }, [onMessagesDelivered, onMessagesRead, queryClient])

  // Listen for real-time messages and unread updates
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Update messages cache (only if we are in that conversation)
      queryClient.setQueryData<Message[]>(
        ["messages", message.conversationId],
        (old) => {
          if (!old) return old // Don't create if doesn't exist to avoid loading issues
          const exists = old.find((m) => m._id === message._id)
          if (exists) return old
          return [...old, message]
        }
      )

      // Update conversation list last message
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

    const handleUnreadUpdate = (data: {
      conversationId: string
      unreadCount: Record<string, number>
    }) => {
      queryClient.setQueryData<Conversation[]>(["conversations"], (old) => {
        if (!old) return old
        return old.map((c) => {
          if (c._id === data.conversationId) {
            return {
              ...c,
              unreadCount: data.unreadCount,
            }
          }
          return c
        })
      })
    }

    const cleanupNewMessage = onNewMessage(handleNewMessage)
    const cleanupUnreadUpdate = onUnreadCountUpdate(handleUnreadUpdate)

    return () => {
      cleanupNewMessage?.()
      cleanupUnreadUpdate?.()
    }
  }, [onNewMessage, onUnreadCountUpdate, queryClient, selectedId])

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
    joinConversation,
    leaveConversation,
  }
}
