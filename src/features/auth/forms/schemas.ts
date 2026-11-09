import z from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Confirm password does not match new password',
    path: ['confirmNewPassword'],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password cannot be the same as the current password',
    path: ['newPassword'],
  })

export const resetPasswordSchema = z
  .object({
    username: z.string().min(1, 'Please select an account'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Confirm password does not match new password',
    path: ['confirmNewPassword'],
  })
