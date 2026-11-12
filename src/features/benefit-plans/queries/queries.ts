import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import type {
  BenefitPlanPagination,
  BenefitPlanResponse,
  UpsertBenefitPlanRequest,
} from '#/types/benefitPlans.type'

export interface BenefitPlanFilterParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  departmentId?: string
  positionId?: string
  benefitId?: string
}

export const useGetAllBenefitPlansQuery = (
  params?: BenefitPlanFilterParams,
) => {
  params = params || {}
  params.pageSize = params.pageSize || 10
  return useQuery({
    queryKey: ['benefitPlans', params],
    queryFn: async () => {
      return await api.get<BenefitPlanPagination>('/benefitplans', {
        params: params as Record<string, string | number>,
      })
      // if (Array.isArray(res)) return res as BenefitPlanResponse[]
      // if (Array.isArray(res?.data)) return res.data as BenefitPlanResponse[]
      // return [] as BenefitPlanResponse[]
    },
    initialData: null,
  })
}

export const useGetBenefitPlanByIdQuery = (
  departmentId: string,
  benefitId: string,
  positionId: string,
) =>
  useQuery({
    queryKey: ['benefitPlans', departmentId, benefitId, positionId],
    queryFn: () => {
      return api.get<BenefitPlanResponse>(
        `/benefitplans/${departmentId}/${benefitId}/${positionId}`,
      )
    },
    enabled: !!departmentId && !!benefitId && !!positionId,
  })

export const useCreateBenefitPlanMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertBenefitPlanRequest) => {
      return api.post<{ message: string }>('/benefitplans', body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitPlans'] })
    },
  })
}

export const useUpdateBenefitPlanMutation = (
  departmentId: string,
  benefitId: string,
  positionId: string,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertBenefitPlanRequest) => {
      return api.put<{ message: string }>(
        `/benefitplans/${departmentId}/${benefitId}/${positionId}`,
        body,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitPlans'] })
    },
  })
}

export const useDeleteBenefitPlanMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      departmentId,
      benefitId,
      positionId,
    }: {
      departmentId: string
      benefitId: string
      positionId: string
    }) => {
      return api.delete<{ message: string }>(
        `/benefitplans/${departmentId}/${benefitId}/${positionId}`,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitPlans'] })
    },
  })
}
