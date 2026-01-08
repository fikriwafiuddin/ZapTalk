import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ChatLayout from "./pages/chat/ChatLayout"
import QueryProvider from "./components/providers/QueryProvider"
import { SocketContextProvider } from "./components/providers/SocketContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import PublicRoute from "./components/auth/PublicRoute"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <SocketContextProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatLayout />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </SocketContextProvider>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
