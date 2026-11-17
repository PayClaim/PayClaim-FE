import { api } from '#/lib/api-client'
import { useQuery } from '@tanstack/react-query'

export interface DashboardTodaySummary {
  myAttentionClaimsCount: number
  myAttentionProposalsCount: number
  myUpdatedClaimsCount: number
  myUpdatedProposalsCount: number
  pendingClaimApprovalsCount: number
  pendingTripApprovalsCount: number
}

export interface DashboardBenefitItem {
  employeeBenefitId: string
  benefitName: string
  balance: number
  periodType?: string | number | null
  startDate?: string
  endDate?: string
}

export interface ExpenseBucket {
  key: string
  label: string
  amount: number
}

export interface ExpenseTrendPeriod {
  totalPaid: number
  paidCount: number
  highestAmount: number | null
  lowestAmount: number | null
  buckets: ExpenseBucket[]
}

export interface DashboardRecentAction {
  id: string
  type: 'Claim' | 'Trip'
  title: string
  description: string
  status: string
  amount: number
  date: string
  href: string
}

export interface DashboardSummaryResponse {
  todaySummary: DashboardTodaySummary
  benefits: DashboardBenefitItem[]
  claimStatusOverview: Record<string, Record<string, number>>
  tripStatusOverview: Record<string, Record<string, number>>
  myExpenseTrend: Record<string, ExpenseTrendPeriod>
  companyExpenseTrend: Record<string, ExpenseTrendPeriod>
  recentActions: DashboardRecentAction[]
}

export const useGetDashboardSummaryQuery = (enabled = true) =>
  useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get<DashboardSummaryResponse>('/dashboard/summary'),
    enabled,
  })
