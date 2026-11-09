import { api } from '#/lib/api-client'
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from '#/types/employee.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetAllEmployeeQuery = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: () => {
      return api.get<EmployeeResponse[]>('/employees')
    },
    initialData: [],
  })

export const useGetEmployeeQuery = (id: string) =>
  useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      return api.get<EmployeeResponse>(`/employees/${id}`)
    },
    initialData: null,
  })

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEmployeeRequest) => {
      return api.post('/employees', body)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export const useUpdateEmployeeMutation = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateEmployeeRequest) => {
      return api.put(`/employees/${id}`, body)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return api.delete(`/employees/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export const useActivateEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      return api.patch(`/employees/${id}/activate`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}
