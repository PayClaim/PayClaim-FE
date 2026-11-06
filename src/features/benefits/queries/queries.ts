import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { data } from './dummy'
import { api } from '#/lib/api-client'
import type {
  BenefitResponse,
  CreateBenefitRequest,
} from '#/types/benefits.type'

export const useGetAllBenefitsQuery = () =>
  useQuery({
    queryKey: ['benefits'],
    queryFn: () => {
      return api.get<BenefitResponse[]>('/benefits')
    },
    initialData: [],
  })

export const useGetBenefitQuery = (id: string) =>
  useQuery({
    queryKey: ['benefits', id],
    queryFn: async () => {
      await setTimeout(() => {}, 1000)
      return Promise.resolve(data.find((d) => d.id === id))
    },
    initialData: null,
  })

export const useCreateBenefitMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBenefitRequest) => {
      return api.post('/benefits', body)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['benefits'] }),
  })
}
export const useUpdateBenefitMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBenefitRequest) => {
      return api.put(`/benefits/${id}`, body)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['benefits'] }),
  })
}
export const useDeleteBenefitMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return api.delete(`/benefits/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['benefits'] }),
  })
}
/**
    public Guid Id
    public ClaimType ClaimType
    public string Description
    public DateOnly TransactionDate
    public decimal Amount
    public DateTime SubmittedAt
    public ClaimStatus Status
    public Guid EmployeeId
    public string? EmployeeName
    public string? BenefitName
    public string? TripProposalDescription
    public string? FilePath

*/
