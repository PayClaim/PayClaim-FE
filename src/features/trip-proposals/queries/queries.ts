import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { api } from '#/lib/api-client'
import { getToken } from '#/hooks/auth.hook'
import type { TripProposal, TripProposalDetailResponse } from '#/types/tripProposals.type'

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

const getAllProposals = async (employeeId?: string): Promise<TripProposal[]> => {
  const token = getToken()

  if (!token) {
    throw new Error('Authentication token not found. Please login again.')
  }

  const apiUrl = import.meta.env.VITE_API_URL
  const queryParam = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ''

  const response = await fetch(`${apiUrl}/trip-proposals${queryParam}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()

    throw new Error(
      `HTTP ${response.status} ${response.statusText}: ${errorText}`,
    )
  }

  const result: PagedResponse<TripProposal> = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch trip proposals.')
  }

  return result.data
}

export const useGetAllProposalsQuery = (employeeId?: string) =>
  useQuery({
    queryKey: employeeId
      ? ['trip-proposals', { employeeId }]
      : ['trip-proposals'],
    queryFn: () => getAllProposals(employeeId),
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
    queryFn: () =>
      api.get<TripProposalDetailResponse>(`/trip-proposals/${id}`),
    enabled: Boolean(id),
  })

export const useGetTripProposalByIdQuery = useGetProposalByIdQuery

type TripProposalApprovalBody = {
  decision: 'Approved' | 'Rejected' | 'NeedsRevision'
  notes?: string
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
