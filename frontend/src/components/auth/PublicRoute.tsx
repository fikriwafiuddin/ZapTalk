import { useAuth } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"
import { Navigate } from "react-router-dom"

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/chat" replace />
  }

  return <>{children}</>
}
