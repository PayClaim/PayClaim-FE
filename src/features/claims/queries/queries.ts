import { api } from '#/lib/api-client'
import type {
  ClaimApprovalActionRequest,
  ClaimPayActionRequest,
  ClaimResponseWithHistory,
  MyClaimResponse,
} from '#/types/claims.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface ClaimFilterParams {
  search?: string
  claimType?: string
  status?: string
  startDate?: string
  endDate?: string
  employeeId?: string
  pageNumber?: number
  pageSize?: number
}

// Digunakan oleh Admin / Manager / Finance untuk melihat semua klaim
export const useGetAdminAllClaimsQuery = (
  params?: ClaimFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: ['admin.claims', params],
    queryFn: async () => {
      return api.get<MyClaimResponse>('/claims', {
        params: params as Record<string, string | number>,
      })
    },
    enabled,
  })

// Digunakan untuk klaim pribadi (My Claims)
export const useGetAllClaimsQuery = (
  params?: ClaimFilterParams,
  enabled = true,
) =>
  useQuery({
    queryKey: ['claims', params],
    queryFn: async () => {
      return api.get<MyClaimResponse>('/claims/my-claims', {
        params: params as Record<string, string | number>,
      })
    },
    enabled,
  })

// Digunakan untuk detail klaim & riwayat approval
export const useGetClaimsQuery = (id: string) =>
  useQuery({
    queryKey: ['claims', id],
    queryFn: async () => {
      return api.get<ClaimResponseWithHistory>(`/claims/${id}`)
    },
    enabled: !!id,
  })

export const useCreateClaimMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => {
      return api.post('/claims', body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin.claims'] })
      queryClient.invalidateQueries({ queryKey: ['employeesBenefit.me'] })
    },
  })
}

// Resubmit / Update claim (needs revision)
export const useUpdateClaimMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FormData) => {
      return api.put(`/claims/${id}`, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', id] })
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin.claims'] })
      queryClient.invalidateQueries({ queryKey: ['employeesBenefit.me'] })
    },
  })
}

// Action: Approve Claim
export const useApproveClaimMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClaimApprovalActionRequest) => {
      return api.post(`/claims/${id}/approve`, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', id] })
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin.claims'] })
      queryClient.invalidateQueries({ queryKey: ['employeesBenefit.me'] })
    },
  })
}

// Action: Reject Claim
export const useRejectClaimMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClaimApprovalActionRequest) => {
      return api.post(`/claims/${id}/reject`, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', id] })
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin.claims'] })
    },
  })
}

// Action: Pay Claim
export const usePayClaimMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ClaimPayActionRequest) => {
      return api.post(`/claims/${id}/pay`, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', id] })
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['admin.claims'] })
    },
  })
}
