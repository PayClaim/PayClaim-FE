import { useQuery } from '@tanstack/react-query'
import { getToken } from '#/hooks/auth.hook'
import type { TripProposal } from '#/types/tripProposals.type'

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

const getAllProposals = async (): Promise<TripProposal[]> => {
  const token = getToken()

  if (!token) {
    throw new Error('Authentication token not found. Please login again.')
  }

  const apiUrl = import.meta.env.VITE_API_URL

  const response = await fetch(`${apiUrl}/trip-proposals`, {
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

export const useGetAllProposalsQuery = () =>
  useQuery({
    queryKey: ['trip-proposals'],
    queryFn: getAllProposals,
  })