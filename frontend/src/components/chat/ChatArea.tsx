import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useRef } from "react"
import { useSocket } from "@/components/providers/SocketContext"
import { API_URL } from "@/lib/constant"

export function ChatArea() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get("id")
  const { user } = useAuth()
  const { conversations, useMessages, sendMessage } = useChat()
  const { onlineUsers } = useSocket()

  const conversation = conversations?.find((c) => c._id === selectedId)
  const { data: messages, isLoading } = useMessages(selectedId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem("message") as HTMLInputElement
    const content = input.value.trim()

    if (!content || !selectedId) return

    sendMessage.mutate({ conversationId: selectedId, content })
    form.reset()
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  if (!conversation || !user) return null

  // Determine other user for header
  const otherUser = conversation.participants.find((p) => p._id !== user._id)
  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2"
            onClick={() => setSearchParams({})}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {otherUser?.photoProfile ? (
            <img
              src={`${API_URL}/${otherUser.photoProfile}`}
              alt={otherUser.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-semibold text-primary">
                {getInitials(otherUser?.username || "??")}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm">{otherUser?.username}</h3>
            <p
              className={`text-xs ${
                isOnline
                  ? "text-green-500 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading messages...
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Say hi! 👋
          </div>
        ) : (
          messages.map((message: any) => {
            const isMe = message.sender._id === user._id
            return (
              <div
                key={message._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted rounded-bl-none"
                  }`}
                >
                  {message.content}
                  <div
                    className={`text-[10px] mt-1 flex items-center gap-1 ${
                      isMe
                        ? "text-primary-foreground/70 justify-end"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMe && (
                      <span className="flex items-center">
                        {message.isRead ? (
                          <CheckCheck className="h-3 w-3 text-sky-400" />
                        ) : message.isDelivered ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form className="flex item-center gap-2" onSubmit={handleSendMessage}>
          <Input
            name="message"
            placeholder="Type a message..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
