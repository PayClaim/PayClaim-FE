import { useQuery } from '@tanstack/react-query'
import { data } from './dummy'

export const useGetAllDepartmentsQuery = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      await setTimeout(() => {}, 1000)
      return Promise.resolve(data)
    },
    initialData: [],
  })

export const useGetDepartmentQuery = (id: string) =>
  useQuery({
    queryKey: ['departments', id],
    queryFn: async () => {
      await setTimeout(() => {}, 1000)
      return Promise.resolve(data.find((d) => d.id === id))
    },
    initialData: null,
  })

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
