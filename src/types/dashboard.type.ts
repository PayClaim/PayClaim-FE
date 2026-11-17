import type { LucideIcon } from 'lucide-react'

export type DashboardRoute =
  | '/claims'
  | '/claims/create'
  | '/trip-proposals'
  | '/trip-proposals/create'
  | '/approvals/claims'
  | '/approvals/trip-proposals'

export type PeriodFilter = 'month' | 'sixMonths' | 'year' | 'all'

export type BenefitFrequency = 'monthly' | 'yearly' | 'all'

export type OverviewView = 'claims' | 'trips'

export type DashboardClaim = {
  id: string
  employeeId?: string
  employeeName?: string | null
  amount: number
  status: string
  transactionDate?: string | null
  submittedAt?: string | null
  updatedAt?: string | null
  modifiedAt?: string | null
  claimType?: string | null
  benefitName?: string | null
  tripProposalDescription?: string | null
  description?: string | null
}

export type DashboardProposal = {
  id: string
  destination: string
  status: string
  totalAmount: number
  submittedAt?: string | null
  updatedAt?: string | null
  modifiedAt?: string | null
  startDate?: string
  endDate?: string
  picEmployeeId?: string | null
  picName?: string | null
}

export type DashboardBenefit = {
  employeeBenefitId: string
  benefitName: string
  balance: number
  periodType?: string | number | null
  startDate?: string
  endDate?: string
  periodStartDate?: string
  periodEndDate?: string
  validFrom?: string
  validTo?: string
  createdAt?: string
}

export type TodaySummaryAction = {
  id: string
  title: string
  description: string
  count: number
  to: DashboardRoute
  search?: Record<string, string | undefined>
}

export type RecentAction = {
  id: string
  type: 'Claim' | 'Trip'
  title: string
  description: string
  status: string
  isOwn: boolean
  amount: number
  date: string
  timestamp: number
  href: string
}

export type ExpenseBucket = {
  key: string
  label: string
  amount: number
}

export type StatusDefinition = {
  key: string
  label: string
  color: string
}

export type QuickAccessItem = {
  title: string
  description: string
  to: DashboardRoute
  icon: LucideIcon
}