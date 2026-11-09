import { api } from '#/lib/api-client'
import type {
  ClaimResponseWithHistory,
  MyClaimResponse,
} from '#/types/claims.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetAllClaimsQuery = () =>
  useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      return api.get<MyClaimResponse>('/claims/my-claims')
    },
    initialData: null,
  })

export const useGetClaimsQuery = (id: string) =>
  useQuery({
    queryKey: ['claims', id],
    queryFn: async () => {
      return api.get<ClaimResponseWithHistory>(`/claims/${id}`)
    },
    initialData: null,
  })

export const useCreateClaimMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => {
      return api.post('/claims', body)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  })
}
