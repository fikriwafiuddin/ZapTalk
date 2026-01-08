export interface ErrorResponse<TErrors = Record<string, unknown>> {
  success: false
  message: string
  errors: TErrors | Record<string, unknown>
  data: object
  meta: { timestamp: string }
}

export interface User {
  _id: string
  username: string
  email: string
  photoProfile: string | null
}

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
