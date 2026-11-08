import { api } from '#/lib/api-client'
import { storage } from '#/lib/storage'
import type { LoginResponse, UserProfile } from '#/types/auth.type'
import { queryOptions, useMutation } from '@tanstack/react-query'

interface LoginBody {
  username: string
  password: string
}

export const loginMutation = () =>
  useMutation({
    mutationFn: (body: LoginBody) => {
      return api.post<LoginResponse>('/auth/login', body)
    },

    onSuccess: (res) => {
      storage.set('token', res.data.token)
    },
  })

export const getCurrentUser = () =>
  queryOptions({
    queryKey: ['authUser'],
    queryFn: () => {
      return api.get<UserProfile>('/auth/me')
    },
    staleTime: Infinity,
    retry: false,
  })
