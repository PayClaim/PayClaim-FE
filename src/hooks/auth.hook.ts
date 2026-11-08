import type { User } from '#/types/user.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

const u: User = {
  id: 'a',
  username: 'Username 1',
  email: 'email',
  role: 'Employee',
}

// api call user profile (/auth/me) => return User
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
  // try {
  //   api.post<LoginResponse>("/api/auth/login")
  // } catch (err) {
  //   console.error(err)
  // }
  localStorage.setItem('user_session', JSON.stringify(u))
  return getAuthUser()
}

const logoutApi = async () => {
  await new Promise((r) => setTimeout(r, 1000))
  localStorage.removeItem('user_session')
}

export function useAuth() {
  const { user } = useRouteContext({ from: '/_app' })

  return {
    user,
  }
}

export function useAuthAction() {
  const queryClient = useQueryClient()
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (d) => {
      queryClient.setQueryData(['authUser'], d)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(['authUser'], null)
      //   queryClient.clear()
    },
  })

  return {
    isLoggingIn: loginMutation.isPending,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  }
}

export type AuthContext = ReturnType<typeof useAuth>
