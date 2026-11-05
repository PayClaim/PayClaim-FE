import { useQuery } from '@tanstack/react-query'
import { data } from './dummy'

export const useGetAllClaimsQuery = () =>
  useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      await setTimeout(() => {}, 1000)
      return Promise.resolve(data)
    },
    initialData: [],
  })

export const useGetClaimsQuery = (id: string) =>
  useQuery({
    queryKey: ['claims', id],
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
