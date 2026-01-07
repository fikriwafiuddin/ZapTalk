import { useSearchParams } from "react-router-dom"
import { MessageSquare } from "lucide-react"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatArea } from "@/components/chat/ChatArea"
import { cn } from "@/lib/utils"

export default function ChatLayout() {
  const [searchParams] = useSearchParams()
  const selectedId = searchParams.get("id")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar: 
          - Mobile: Visible if NO conversation selected
          - Desktop: Always visible (w-80)
      */}
      <div
        className={cn(
          "h-full w-full md:w-80 md:flex flex-col md:border-r",
          selectedId ? "hidden" : "flex"
        )}
      >
        <ChatSidebar />
      </div>

      {/* Main Chat Area:
          - Mobile: Visible if conversation SELECTED
          - Desktop: Always visible (flex-1)
      */}
      <div
        className={cn(
          "h-full flex-1 md:flex flex-col",
          !selectedId ? "hidden" : "flex"
        )}
      >
        {selectedId ? (
          <ChatArea />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-4 space-y-4 text-muted-foreground">
            <div className="bg-muted/50 p-6 rounded-full">
              <MessageSquare className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Select a conversation
              </h3>
              <p>Choose a chat from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
