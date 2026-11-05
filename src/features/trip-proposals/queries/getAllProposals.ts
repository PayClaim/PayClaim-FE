import type { TripProposal } from '#/types/tripProposals.type'
import { useQuery } from '@tanstack/react-query'

export const getAllClaimsQuery = () =>
  useQuery({
    queryKey: ['employee.claims'],
    queryFn: async () => {
      await setTimeout(() => {}, 1000)
      return Promise.resolve(data)
    },
    initialData: [],
  })

const data: TripProposal[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    destination: 'Yogyakarta, Indonesia',
    startDate: new Date('2026-11-15T07:00:00Z'),
    endDate: new Date('2026-11-18T18:00:00Z'),
    totalAmount: 12500000,
    submittedAt: new Date('2026-11-01T09:15:30Z'),
    status: 'APPROVED',
    picName: 'Budi Santoso',
    participantCount: 4,
    filePath: '/uploads/proposals/jogja-trip-v1.pdf',
  },
  {
    id: 'f9e8d7c6-b5a4-3c2b-1a0f-9e8d7c6b5a4b',
    destination: 'Singapore',
    startDate: new Date('2026-12-05T06:00:00Z'),
    endDate: new Date('2026-12-09T22:00:00Z'),
    totalAmount: 45000000,
    submittedAt: new Date('2026-11-03T14:22:10Z'),
    status: 'SUBMITTED',
    picName: 'Siti Rahmawati',
    participantCount: 2,
    filePath: '/uploads/proposals/sg-conference-budget.xlsx',
  },
  {
    id: '5d4c3b2a-1e0f-9a8b-7c6d-5e4f3a2b1c0d',
    destination: 'Bali, Indonesia',
    startDate: new Date('2026-11-20T08:00:00Z'),
    endDate: new Date('2026-11-25T17:00:00Z'),
    totalAmount: 28000000,
    submittedAt: new Date('2026-10-28T11:05:00Z'),
    status: 'APPROVED',
    participantCount: 6,
    // picName dan filePath sengaja dikosongkan untuk menguji sifat optional (?)
  },
  {
    id: '3f9c8d2b-6e5a-4b7c-ad1a-2b9c4d8e6f02',
    destination: 'Tokyo, Japan',
    startDate: new Date('2027-01-15T05:00:00Z'),
    endDate: new Date('2027-01-22T23:30:00Z'),
    totalAmount: 98000000,
    submittedAt: new Date('2026-11-02T16:45:00Z'),
    status: 'COMPLETED',
    picName: 'Kevin Wijaya',
    participantCount: 3,
    filePath: '/uploads/proposals/japan-expo-itinerary.pdf',
  },
  {
    id: '7e6d5c4b-3a2b-1c0d-ef9e-8d7c6b5a4b3a',
    destination: 'Bandung, Indonesia',
    startDate: new Date('2026-11-10T09:00:00Z'),
    endDate: new Date('2026-11-12T20:00:00Z'),
    totalAmount: 5500000,
    submittedAt: new Date('2026-10-25T08:00:00Z'),
    status: 'REJECTED',
    picName: 'Dewi Lestari',
    participantCount: 5,
    filePath: '/uploads/proposals/bandung-workshop.pdf',
  },
]
