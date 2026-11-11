import { api } from '#/lib/api-client'
import type {
  CreateEmployeeRequest,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from '#/types/employee.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetAllEmployeeQuery = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const res = await api.get<any>('/employees', { params })
      if (Array.isArray(res)) return res as EmployeeResponse[]
      if (Array.isArray(res?.data)) return res.data as EmployeeResponse[]
      return [] as EmployeeResponse[]
    },
    initialData: null,
  })

export const useGetEmployeeQuery = (id: string) =>
  useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      return api.get<EmployeeResponse>(`/employees/${id}`)
    },
    enabled: Boolean(id),
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
