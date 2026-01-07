import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/useChat"

export function NewChatDialog() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [, setSearchParams] = useSearchParams()

  const { useSearchUsers, createConversation } = useChat()
  const { data: users, isLoading } = useSearchUsers(search)

  const handleStartChat = async (userId: string) => {
    try {
      const conversation = await createConversation.mutateAsync(userId)
      setSearchParams({ id: conversation._id })
      setOpen(false)
      setSearch("")
    } catch (error) {
      console.error("Failed to create conversation", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <UserPlus className="h-5 w-5" />
          <span className="sr-only">New Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Searching...
              </p>
            ) : !users || users.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {search.length < 2
                  ? "Type at least 2 characters to search"
                  : "No users found."}
              </p>
            ) : (
              users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleStartChat(user._id)}
                  className={cn(
                    "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.photoProfile ? (
                      <img
                        src={user.photoProfile}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-primary">
                        {getInitials(user.username)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
