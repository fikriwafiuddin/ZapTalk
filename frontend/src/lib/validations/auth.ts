import { z } from "zod"

export const registerSchema = z
  .object({
    username: z
      .string({
        error: "Username is required.",
      })
      .min(2, {
        error: "Username must be at least 2 characters.",
      }),
    email: z.email({
      error: "Please enter a valid email address.",
    }),
    password: z
      .string({
        error: "Password is required.",
      })
      .min(6, {
        error: "Password must be at least 6 characters.",
      }),
    confirmPassword: z
      .string({
        error: "Confirm password is required.",
      })
      .min(6, {
        error: "Confirm password must be at least 6 characters.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type RegisterValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.email({
    error: "Please enter a valid email address.",
  }),
  password: z
    .string({
      error: "Password is required.",
    })
    .min(6, {
      error: "Password must be at least 6 characters.",
    }),
})

export type LoginValues = z.infer<typeof loginSchema>

export const profileSchema = z.object({
  username: z
    .string({
      message: "Username is required.",
    })
    .min(2, {
      message: "Username must be at least 2 characters.",
    }),
})

export type ProfileValues = z.infer<typeof profileSchema>
