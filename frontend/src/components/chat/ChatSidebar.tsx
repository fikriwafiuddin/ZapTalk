import { useSearchParams } from "react-router-dom"
import { Check, CheckCheck, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { NewChatDialog } from "@/components/chat/NewChatDialog"
import { ProfileSettingsDialog } from "@/components/chat/ProfileSettingsDialog"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useChat } from "@/hooks/useChat"
import { API_URL } from "@/lib/constant"
import { Button } from "@/components/ui/button"

export function ChatSidebar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get("id")
  const { user, logout } = useAuth()
  const { conversations, isLoading } = useChat()

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  // Helper to get other user in conversation
  const getOtherUser = (participants: any[]) => {
    return participants.find((p) => p._id !== user?._id)
  }

  // Helper to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ProfileSettingsDialog>
              <button className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden">
                {user?.photoProfile ? (
                  <img
                    src={`${API_URL}/${user.photoProfile}`}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {getInitials(user?.username || "ME")}
                  </span>
                )}
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </button>
            </ProfileSettingsDialog>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold leading-none">
                {user?.username}
              </h2>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NewChatDialog />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
        <Input placeholder="Search messages..." className="bg-background" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 p-2">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading chats...
            </div>
          ) : conversations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-xs">Start a new chat to begin</p>
            </div>
          ) : (
            conversations?.map((chat) => {
              const otherUser = getOtherUser(chat.participants)
              if (!otherUser) return null

              return (
                <button
                  key={chat._id}
                  onClick={() => setSearchParams({ id: chat._id })}
                  className={cn(
                    "flex items-center gap-3 p-3 text-left rounded-lg transition-colors hover:bg-muted/50",
                    selectedId === chat._id && "bg-muted"
                  )}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {otherUser.photoProfile ? (
                        <img
                          src={`${API_URL}/${otherUser.photoProfile}`}
                          alt={otherUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-primary">
                          {getInitials(otherUser.username)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {otherUser.username}
                      </span>
                      {chat.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {chat.lastMessage &&
                          chat.lastMessage.sender?._id === user?._id && (
                            <span className="flex-shrink-0">
                              {chat.lastMessage.isRead ? (
                                <CheckCheck className="h-3 w-3 text-sky-400" />
                              ) : chat.lastMessage.isDelivered ? (
                                <CheckCheck className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Check className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                          )}
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage
                            ? chat.lastMessage.content
                            : "Start a conversation"}
                        </p>
                      </div>
                      {user && chat?.unreadCount[user?._id] > 0 && (
                        <span className="ml-1 flex h-4 sm:h-5 min-w-[1rem] sm:min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 sm:px-1.5 text-[10px] sm:text-xs font-medium text-primary-foreground flex-shrink-0">
                          {chat.unreadCount[user?._id]}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
