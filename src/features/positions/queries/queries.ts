import { api } from '#/lib/api-client'
import type { PositionResponse } from '#/types/position.type'
import { useQuery } from '@tanstack/react-query'

export const useGetAllPositionsQuery = () =>
  useQuery({
    queryKey: ['positions'],
    queryFn: () => {
      return api.get<PositionResponse[]>('/positions')
    },
    initialData: [],
  })

export const useGetPositionQuery = (id: string) =>
  useQuery({
    queryKey: ['positions', id],
    queryFn: async () => {
      return api.get<PositionResponse>('/positions')
    },
    initialData: null,
  })
