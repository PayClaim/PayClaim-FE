import { api } from '#/lib/api-client'
import type { EmployeeBenefitResponse } from '#/types/employeeBenefit.type'
import { useQuery } from '@tanstack/react-query'

export const useGetAllEmployeeBenefitsQuery = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: () => {
      return api.get<EmployeeBenefitResponse[]>('/employeeBenefits')
    },
    initialData: [],
  })
