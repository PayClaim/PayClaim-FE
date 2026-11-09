import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import type {
  BenefitCategoryResponse,
  UpdateBenefitCategory,
} from '#/types/benefitCategories'

export const useGetAllCategoriesQuery = () =>
  useQuery({
    queryKey: ['benefit-categories'],
    queryFn: () => {
      return api.get<BenefitCategoryResponse[]>('/benefitCategories')
    },
    initialData: [],
  })

export const useGetCategoryQuery = (id: number) =>
  useQuery({
    queryKey: ['benefit-categories', id],
    queryFn: () => api.get<BenefitCategoryResponse>(`/benefitCategories/${id}`),
    enabled: typeof id === 'number' && !isNaN(id),
  })

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateBenefitCategory) => {
      return api.post('/benefitCategories', body)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['benefit-categories'] }),
  })
}

export const useUpdateCategoryMutation = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateBenefitCategory) => {
      return api.put(`/benefitCategories/${id}`, body)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['benefit-categories'] }),
  })
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/benefitCategories/${id}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['benefit-categories'] }),
  })
}
