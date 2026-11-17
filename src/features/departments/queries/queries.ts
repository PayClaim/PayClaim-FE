import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api-client'
import type {
  CreateDepartmentRequest,
  DepartmentResponse,
  UpdateDepartmentRequest,
} from '#/types/department.type'

export const useGetAllDepartmentsQuery = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: async () => api.get<DepartmentResponse[]>('/departments'),
    staleTime: 10 * 60 * 1000,
  })

export const useGetDepartmentQuery = (id: string) =>
  useQuery({
    queryKey: ['departments', id],
    queryFn: async () => api.get<DepartmentResponse>(`/departments/${id}`),
    enabled: Boolean(id),
  })

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDepartmentRequest) => {
      return api.post('/departments', body)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export const useUpdateDepartmentMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateDepartmentRequest) => {
      return api.put(`/departments/${id}`, body)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return api.delete(`/departments/${id}`)
    },
    // Optimistic remove: baris langsung hilang dari tabel, lalu di-rollback
    // bila server menolak.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['departments'] })

      const previous = queryClient.getQueryData<DepartmentResponse[]>([
        'departments',
      ])

      if (previous) {
        queryClient.setQueryData<DepartmentResponse[]>(
          ['departments'],
          previous.filter((department) => department.id !== id),
        )
      }

      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['departments'], context.previous)
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['departments'] }),
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
