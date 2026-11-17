import type {
  BenefitFrequency,
  DashboardBenefit,
  DashboardClaim,
  ExpenseBucket,
  PeriodFilter,
  StatusDefinition,
} from '#/types/dashboard.type'

// =====================================================
// STATUS CONFIGURATION
// =====================================================

export const CLAIM_STATUSES: StatusDefinition[] = [
  {
    key: 'submitted',
    label: 'Submitted',
    color: 'bg-amber-500',
  },
  {
    key: 'underreview',
    label: 'Under Review',
    color: 'bg-[#2F81F7]',
  },
  {
    key: 'approved',
    label: 'Approved',
    color: 'bg-emerald-500',
  },
  {
    key: 'paid',
    label: 'Paid',
    color: 'bg-teal-500',
  },
  {
    key: 'needsrevision',
    label: 'Needs Revision',
    color: 'bg-orange-500',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    color: 'bg-rose-500',
  },
]

export const TRIP_STATUSES: StatusDefinition[] = [
  {
    key: 'submitted',
    label: 'Submitted',
    color: 'bg-amber-500',
  },
  {
    key: 'underreview',
    label: 'Under Review',
    color: 'bg-[#2F81F7]',
  },
  {
    key: 'financemanagerreview',
    label: 'Finance Manager Review',
    color: 'bg-violet-500',
  },
  {
    key: 'approved',
    label: 'Approved',
    color: 'bg-emerald-500',
  },
  {
    key: 'completed',
    label: 'Completed',
    color: 'bg-teal-500',
  },
  {
    key: 'needsrevision',
    label: 'Needs Revision',
    color: 'bg-orange-500',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    color: 'bg-rose-500',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    color: 'bg-rose-500',
  },
]

// =====================================================
// COMMON HELPERS
// =====================================================

export function normalizeStatus(status: unknown): string {
  return String(status ?? '')
    .replace(/[\s_-]/g, '')
    .toLowerCase()
}

export function getAmount(value: unknown): number {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? amount : 0
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function getDateKey(value?: string | null): string {
  if (!value) return ''

  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)

  return match?.[1] ?? ''
}

export function getTimestamp(value?: string | null): number {
  if (!value) return 0

  const timestamp = new Date(value).getTime()

  return Number.isFinite(timestamp) ? timestamp : 0
}

export function formatDate(value?: string | null): string {
  const dateKey = getDateKey(value)

  if (!dateKey) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(`${dateKey}T12:00:00+07:00`))
}

// =====================================================
// JAKARTA DATE
// =====================================================

export function getJakartaDateParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
  }
}

function getMonthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

// =====================================================
// PERIOD FILTER
// =====================================================

export function getPeriodStartKey(period: PeriodFilter): string {
  const current = getJakartaDateParts()
  const year = Number(current.year)
  const month = Number(current.month) - 1

  if (period === 'month') {
    return `${current.year}-${current.month}-01`
  }

  if (period === 'year') {
    return `${current.year}-01-01`
  }

  if (period === 'sixMonths') {
    const start = new Date(Date.UTC(year, month - 5, 1))

    return `${start.getUTCFullYear()}-${String(
      start.getUTCMonth() + 1,
    ).padStart(2, '0')}-01`
  }

  return '0000-01-01'
}

export function matchesPeriod(
  dateValue: string | null | undefined,
  period: PeriodFilter,
): boolean {
  if (period === 'all') return true

  const dateKey = getDateKey(dateValue)

  if (!dateKey) return false

  const current = getJakartaDateParts()
  const currentMonth = `${current.year}-${current.month}`

  if (period === 'month') {
    return dateKey.startsWith(currentMonth)
  }

  if (period === 'year') {
    return dateKey.startsWith(current.year)
  }

  return dateKey >= getPeriodStartKey('sixMonths')
}

export function getPeriodLabel(period: PeriodFilter): string {
  switch (period) {
    case 'month':
      return 'This Month'
    case 'sixMonths':
      return 'Last 6 Months'
    case 'year':
      return 'This Year'
    default:
      return 'All Time'
  }
}

// =====================================================
// UPDATED DATA
// =====================================================

export function getUpdatedAt(item: {
  updatedAt?: string | null
  modifiedAt?: string | null
}): string | null {
  return item.updatedAt || item.modifiedAt || null
}

export function isUpdatedToday(
  submittedAt: string | null | undefined,
  updatedAt: string | null | undefined,
  todayKey: string,
): boolean {
  if (!submittedAt || !updatedAt) return false

  return (
    getTimestamp(updatedAt) > getTimestamp(submittedAt) &&
    getDateKey(updatedAt) === todayKey
  )
}

// =====================================================
// PAID CLAIMS
// =====================================================

function getPaidClaims(claims: DashboardClaim[]) {
  return claims.filter(
    (claim) => normalizeStatus(claim.status) === 'paid',
  )
}

export function getPaidClaimsByPeriod(
  claims: DashboardClaim[],
  period: PeriodFilter,
): DashboardClaim[] {
  return getPaidClaims(claims).filter((claim) =>
    matchesPeriod(claim.transactionDate, period),
  )
}

// =====================================================
// EXPENSE TREND
// =====================================================

export function getExpenseBuckets(
  claims: DashboardClaim[],
  period: PeriodFilter,
): ExpenseBucket[] {
  const paidClaims = getPaidClaimsByPeriod(claims, period)
  const current = getJakartaDateParts()
  const year = Number(current.year)
  const month = Number(current.month) - 1

  if (period === 'month') {
    const buckets: ExpenseBucket[] = Array.from(
      { length: 5 },
      (_, index) => ({
        key: `week-${index + 1}`,
        label: `Week ${index + 1}`,
        amount: 0,
      }),
    )

    paidClaims.forEach((claim) => {
      const day = Number(
        getDateKey(claim.transactionDate).slice(8, 10),
      )

      if (!day) return

      const weekIndex = Math.min(4, Math.floor((day - 1) / 7))

      buckets[weekIndex].amount += getAmount(claim.amount)
    })

    return buckets
  }

  if (period === 'all') {
    const yearAmounts = new Map<number, number>()

    paidClaims.forEach((claim) => {
      const dateKey = getDateKey(claim.transactionDate)

      if (!dateKey) return

      const claimYear = Number(dateKey.slice(0, 4))

      yearAmounts.set(
        claimYear,
        (yearAmounts.get(claimYear) ?? 0) + getAmount(claim.amount),
      )
    })

    return Array.from(yearAmounts.entries())
      .sort(([a], [b]) => a - b)
      .map(([claimYear, amount]) => ({
        key: String(claimYear),
        label: String(claimYear),
        amount,
      }))
  }

  const firstMonth = period === 'year' ? 0 : month - 5
  const numberOfMonths = period === 'year' ? month + 1 : 6

  return Array.from({ length: numberOfMonths }, (_, index) => {
    const date = new Date(
      Date.UTC(year, firstMonth + index, 1),
    )

    const bucketYear = date.getUTCFullYear()
    const bucketMonth = date.getUTCMonth()
    const key = getMonthKey(bucketYear, bucketMonth)

    const amount = paidClaims
      .filter((claim) =>
        getDateKey(claim.transactionDate).startsWith(key),
      )
      .reduce(
        (total, claim) => total + getAmount(claim.amount),
        0,
      )

    return {
      key,
      label: new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
      amount,
    }
  })
}

// =====================================================
// APPROVAL STATUS DISPLAY
// =====================================================

export function getApprovalStatusConfig({
  status,
  type,
  isOwn,
  roles,
}: {
  status: string
  type: 'Claim' | 'Trip'
  isOwn: boolean
  roles: string[]
}) {
  const normalized = normalizeStatus(status)
  const roleLower = roles.map((role) => role.trim().toLowerCase())

  const isAdmin = roleLower.includes('admin')

  const isFinanceManager = roleLower.includes('finance manager')

  const isManager =
    (
      roleLower.includes('manager') ||
      roleLower.includes('project manager')
    ) && !isFinanceManager

  const isFinance =
    roleLower.includes('finance') && !isFinanceManager

  const needsMyApproval =
    !isOwn &&
    (
      (normalized === 'submitted' && (isAdmin || isManager)) ||
      (
        normalized === 'underreview' &&
        (isAdmin || isFinance || isFinanceManager)
      ) ||
      (
        type === 'Trip' &&
        normalized === 'financemanagerreview' &&
        (isAdmin || isFinanceManager)
      )
    )

  if (needsMyApproval) {
    return {
      label: 'Waiting for Your Approval',
      style:
        'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    }
  }

  switch (normalized) {
    case 'submitted':
      return {
        label: 'Waiting for Manager',
        style:
          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
      }

    case 'underreview':
      return {
        label: 'Waiting for Finance',
        style:
          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
      }

    case 'financemanagerreview':
      return {
        label: 'Waiting for Finance Manager',
        style:
          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
      }

    case 'approved':
      return {
        label: 'Approved',
        style:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      }

    case 'paid':
      return {
        label: 'Paid',
        style:
          'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300',
      }

    case 'completed':
      return {
        label: 'Completed',
        style:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      }

    case 'needsrevision':
      return {
        label: 'Needs Revision',
        style:
          'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
      }

    case 'rejected':
      return {
        label: 'Rejected',
        style:
          'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
      }

    case 'cancelled':
      return {
        label: 'Cancelled',
        style:
          'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
      }

    default:
      return {
        label: status,
        style:
          'border-border bg-muted text-muted-foreground',
      }
  }
}

// =====================================================
// BENEFIT FREQUENCY
// =====================================================

export function getBenefitFrequency(
  benefit: DashboardBenefit,
): Exclude<BenefitFrequency, 'all'> | null {
  const periodType = String(benefit.periodType ?? '')
    .trim()
    .toLowerCase()

  if (periodType.includes('monthly') || periodType === 'month') {
    return 'monthly'
  }

  if (
    periodType.includes('yearly') ||
    periodType.includes('annual') ||
    periodType === 'year'
  ) {
    return 'yearly'
  }

  const start = getDateKey(
    benefit.periodStartDate ||
      benefit.startDate ||
      benefit.validFrom,
  )

  const end = getDateKey(
    benefit.periodEndDate ||
      benefit.endDate ||
      benefit.validTo,
  )

  if (!start || !end) return null

  const startTime = new Date(`${start}T00:00:00Z`).getTime()
  const endTime = new Date(`${end}T00:00:00Z`).getTime()

  const durationDays = Math.round(
    (endTime - startTime) / (1000 * 60 * 60 * 24),
  )

  if (!Number.isFinite(durationDays) || durationDays < 0) {
    return null
  }

  return durationDays <= 45 ? 'monthly' : 'yearly'
}

export function benefitMatchesFrequency(
  benefit: DashboardBenefit,
  frequency: BenefitFrequency,
): boolean {
  if (frequency === 'all') return true

  return getBenefitFrequency(benefit) === frequency
}