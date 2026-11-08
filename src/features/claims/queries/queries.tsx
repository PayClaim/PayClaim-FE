import { api } from '#/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCreateClaimMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => {
      return api.post('/claims', body)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  })
}
