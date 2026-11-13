import { api } from '#/lib/api-client'
import type { EmployeeBenefitResponse } from '#/types/employeeBenefit.type'
import { useQuery } from '@tanstack/react-query'

export const useGetAllEmployeeBenefitsQuery = (enabled = true) =>
  useQuery({
    queryKey: ['employeesBenefit.me'],
    queryFn: () => {
      return api.get<EmployeeBenefitResponse[]>('/employeeBenefits/me')
    },
    enabled,
  })