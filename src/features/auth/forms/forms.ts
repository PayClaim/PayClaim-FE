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
import { getFriendlyErrorMessage } from '#/lib/error'

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
        window.location.href = search.redirect ?? '/dashboard'
      } catch (err: unknown) {
        toast.error(getFriendlyErrorMessage(err, 'Gagal masuk. Periksa username dan password Anda.'))
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
        toast.error(getFriendlyErrorMessage(err, 'Gagal mengubah kata sandi'))
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
        toast.error(getFriendlyErrorMessage(err, 'Gagal mengatur ulang kata sandi'))
      }
    },
  })
  return form
}
