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
): Promise<TripProposal[]> => {
  const result = await api.get<PagedResponse<TripProposal>>('/trip-proposals', {
    params: employeeId ? { employeeId } : undefined,
  })
  return result.data ?? []
}

export const useGetAllProposalsQuery = (
  employeeId?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: employeeId
      ? ['trip-proposals', { employeeId }]
      : ['trip-proposals'],
    queryFn: () => getAllProposals(employeeId),
    enabled,
    placeholderData: keepPreviousData,
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
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'summary'],
      })
    },
  })
}

export const useGetProposalByIdQuery = (id: string) =>
  useQuery({
    queryKey: ['trip-proposals', id],
    queryFn: () =>
      api.get<TripProposalDetailResponse>(`/trip-proposals/${id}`),
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['trip-proposals'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard', 'summary'],
        }),
      ])
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['trip-proposals'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard', 'summary'],
        }),
      ])
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['trip-proposals'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard', 'summary'],
        }),
      ])
    },
  })
}