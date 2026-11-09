import { api } from '#/lib/api-client'
import type {
  TripProposal,
  TripProposalDetail,
} from '#/types/tripProposals.type'
import { useQuery } from '@tanstack/react-query'

export interface PagedTripResponse {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  success: boolean
  statusCode: number
  message: string
  data: TripProposal[]
  errors: null
}

export const useGetAllTripProposalsQuery = (params?: {
  destination?: string
  status?: string
  pageNumber?: number
  pageSize?: number
}) =>
  useQuery({
    queryKey: ['tripProposals', params],
    queryFn: async () => {
      const res = await api.get<PagedTripResponse>('/trip-proposals', {
        params: params as Record<string, string | number>,
      })
      return res.data || []
    },
    initialData: [],
  })

export const useGetTripProposalByIdQuery = (id: string | null) =>
  useQuery({
    queryKey: ['tripProposal', id],
    queryFn: async () => {
      if (!id) return null
      return api.get<TripProposalDetail>(`/trip-proposals/${id}`)
    },
    enabled: !!id,
  })
