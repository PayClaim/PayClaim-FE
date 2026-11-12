import { api } from '#/lib/api-client'
import type {
  CreateEmployeeRequest,
  EmployeePagination,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from '#/types/employee.type'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface EmployeeFilterParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  departmentId?: string
  positionId?: string
  isActive?: boolean
}

export const useGetAllEmployeeQuery = (params?: Record<string, any>) => {
  const normalized = { ...params, pageSize: params?.pageSize ?? 10 }
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => {
      return api.get<EmployeePagination>('/employees', { params: normalized })
    },
  })
}

/**
 * Daftar seluruh karyawan (tanpa pagination) untuk kebutuhan dropdown/selector
 * seperti peserta trip proposal dan pilihan manager.
 * Backend mengembalikan semua data bila PageNumber/PageSize tidak dikirim.
 */
export const useGetAllEmployeesQuery = () =>
  useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => {
      const res = await api.get<EmployeePagination | EmployeeResponse[]>(
        '/employees',
      )

      if (Array.isArray(res)) return res as EmployeeResponse[]
      if (Array.isArray(res?.data)) return res.data as EmployeeResponse[]

      return [] as EmployeeResponse[]
    },
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
