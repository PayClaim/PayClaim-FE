import { useAppForm } from '#/hooks/app.form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  changePasswordMutation,
  loginMutation,
  resetPasswordMutation,
} from '../queries/queries'
import {
  changePasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from './schemas'
import { toast } from 'sonner'

export const loginForm = () => {
  const mutation = loginMutation()
  const navigate = useNavigate()
  const search = useSearch({
    from: '/login',
  })
  return useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
        await navigate({
          to: search.redirect ?? '/dashboard',
        })
      } catch (err: any) {
        toast.error('Failed to login.', err)
      }
    },
  })
}

export const changePasswordForm = () => {
  const mutation = changePasswordMutation()
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validators: {
      onBlur: changePasswordSchema,
      onSubmit: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
        toast.success('Password changed successfully')
        await navigate({ to: '/dashboard' })
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to change password')
      }
    },
  })
}

export const resetPasswordForm = () => {
  const mutation = resetPasswordMutation()
  const form = useAppForm({
    defaultValues: {
      username: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validators: {
      onBlur: resetPasswordSchema,
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
        toast.success('Password has been reset successfully')
        form.reset()
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to reset password')
      }
    },
  })
  return form
}
