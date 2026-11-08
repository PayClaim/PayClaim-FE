import { useAppForm } from '#/hooks/app.form'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { loginMutation } from '../queries/queries'
import { loginSchema } from './schemas'
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
