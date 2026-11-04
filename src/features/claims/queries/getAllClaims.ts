import { useQuery } from '@tanstack/react-query'

export const getAllClaimsQuery = () =>
  useQuery({
    queryKey: ['employee.claims'],
    queryFn: async () => {
      await setTimeout(() => {}, 1000)
      return Promise.resolve(data)
    },
  })

const data = [
  {
    id: 1,
    types: 'Reimbursement',
    transaction_date: new Date('2026-10-15T09:30:00Z'),
    amount: 1250.0,
    submittedAt: new Date('2026-10-16T14:22:00Z'),
    status: 'Approved',
    benefitName: 'Annual Travel Allowance',
    tripLocation: 'Tokyo, Japan',
  },
  {
    id: 2,
    types: 'Allowance',
    transaction_date: new Date('2026-10-28T11:15:00Z'),
    amount: 450.5,
    submittedAt: new Date('2026-10-29T08:05:00Z'),
    status: 'Pending',
    benefitName: 'Business Trip Lodging',
    tripLocation: 'New York, USA',
  },
  {
    id: 3,
    types: 'Reimbursement',
    transaction_date: new Date('2026-11-01T16:00:00Z'),
    amount: 85.2,
    submittedAt: new Date('2026-11-02T10:45:00Z'),
    status: 'Processing',
    benefitName: 'Meal Stipend',
    tripLocation: 'London, UK',
  },
  {
    id: 4,
    types: 'Stipend',
    transaction_date: new Date('2026-09-12T14:20:00Z'),
    amount: 320.0,
    submittedAt: new Date('2026-09-13T09:11:00Z'),
    status: 'Rejected',
    benefitName: 'Wellness & Fitness',
    tripLocation: 'None (Remote)',
  },
  {
    id: 5,
    types: 'Reimbursement',
    transaction_date: new Date('2026-10-20T08:00:00Z'),
    amount: 670.0,
    submittedAt: new Date('2026-10-21T11:30:00Z'),
    status: 'Approved',
    benefitName: 'Client Entertainment',
    tripLocation: 'Paris, France',
  },
]
