import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { api } from '#/lib/api-client'

import type {
  TripProposal,
  TripProposalDetailResponse,
} from '#/types/tripProposals.type'
import type { PaginationGeneric } from '#/types/pagination.type'

export interface TripProposalFilterParams {
  destination?: string
  status?: string
  startDateFrom?: string
  startDateTo?: string
  pageNumber?: number
  pageSize?: number
}

type PagedResponse<T> = {
  success: boolean
  statusCode: number
  message: string
  data: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const getAllProposals = async (
  employeeId?: string,
): Promise<PagedResponse<TripProposal>> => {
  return await api.get<PagedResponse<TripProposal>>('/trip-proposals', {
    params: employeeId ? { employeeId } : undefined,
  })
  // return result.data ?? []
}

export const useGetAllProposalsQuery = (
  params?: TripProposalFilterParams,
  // employeeId?: string,
  // enabled = true,
) =>
  useQuery({
    queryKey: ['trip-proposals', params],
    queryFn: () => {
      const normalized = { ...params, pageSize: params?.pageSize ?? 10 }
      return api.get<PaginationGeneric<TripProposal>>('/trip-proposals', {
        params: normalized,
      })
    },
    placeholderData: keepPreviousData,
    // enabled,
  })

export const useGetAllTripProposalsQuery = useGetAllProposalsQuery

export const useCreateTripProposalMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => {
      return api.post('/trip-proposals', formData)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trip-proposals'],
      })
    },
  })
}

export const useGetProposalByIdQuery = (id: string) =>
  useQuery({
    queryKey: ['trip-proposals', id],
    queryFn: () => api.get<TripProposalDetailResponse>(`/trip-proposals/${id}`),
    enabled: Boolean(id),
  })

export const useGetTripProposalByIdQuery = useGetProposalByIdQuery

type TripProposalApprovalBody = {
  decision: 'Approved' | 'Rejected' | 'NeedsRevision'
  notes?: string
  totalAmount?: number
  participants?: {
    employeeId: string
    amount: number
  }[]
}

export const useUpdateTripProposalMutation = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => {
      return api.put(`/trip-proposals/${id}`, formData)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['trip-proposals'],
      })
    },
  })
}

// Approve Trip Proposal
export const useApproveTripProposalMutation = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: TripProposalApprovalBody) =>
      api.post(`/trip-proposals/${id}/approve`, body),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['trip-proposals'],
      })
    },
  })
}

// Reject / Request Revision Trip Proposal
export const useRejectTripProposalMutation = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: TripProposalApprovalBody) =>
      api.post(`/trip-proposals/${id}/reject`, body),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['trip-proposals'],
      })
    },
  })
}
