import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import type { LoginValues, RegisterValues } from "@/lib/validations/auth"

export interface User {
  _id: string
  username: string
  email: string
  photoProfile: string | null
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
  }
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await api.get<AuthResponse>("/auth/verifyUser")
        return res.data.data.user
      } catch (err) {
        return null
      }
    },
    staleTime: Infinity,
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginValues) => {
      const res = await api.post<AuthResponse>("/auth/login", data)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data.data.user)
      navigate("/")
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterValues) => {
      const res = await api.post<AuthResponse>("/auth/register", data)
      return res.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data.data.user)
      navigate("/")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.get("/auth/logout")
    },
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null)
      navigate("/login")
    },
  })

  return {
    user,
    isLoading,
    error,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  }
}
