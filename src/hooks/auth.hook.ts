import type { User } from '#/types/user.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const u: User = {
  id: 'a',
  username: 'Username 1',
  email: 'email',
  role: 'Employee',
}

export const getAuthUser = () => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('user_session')
  return raw ? (JSON.parse(raw) as User) : null
}

export const authQueryOption = {
  queryKey: ['authUser'],
  queryFn: getAuthUser,
  staleTime: Infinity,
  retry: false,
}

const loginApi = async () => {
  await new Promise((r) => setTimeout(r, 1000))
  localStorage.setItem('user_session', JSON.stringify(u))
  return getAuthUser()
}

const logoutApi = async () => {
  await new Promise((r) => setTimeout(r, 1000))
  localStorage.removeItem('user_session')
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
    staleTime: Infinity,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], data)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['authUser'], null)
      //   queryClient.clear()
    },
  })

  return {
    user: data,
    isLoading: isLoading,
    isLoggingIn: loginMutation.isPending,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  }
}
