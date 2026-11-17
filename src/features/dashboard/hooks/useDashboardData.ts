import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import {
  useGetAdminAllClaimsQuery,
  useGetAllClaimsQuery,
} from '#/features/claims/queries/queries'
import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'

import {
  CalendarDays,
  FileText,
  Plane,
  Plus,
  Receipt,
} from 'lucide-react'

import type {
  DashboardBenefit,
  DashboardClaim,
  DashboardProposal,
  QuickAccessItem,
  RecentAction,
  TodaySummaryAction,
} from '#/types/dashboard.type'

import {
  formatDate,
  getAmount,
  getJakartaDateParts,
  getTimestamp,
  getUpdatedAt,
  isUpdatedToday,
  normalizeStatus,
} from '#/features/dashboard/utils/dashboard.utils'

const DASHBOARD_PAGE_SIZE = 100

export function useDashboardData() {
  const [dismissedRejectedIds, setDismissedRejectedIds] = useState<
    string[]
  >([])

  // =====================================================
  // CURRENT USER
  // =====================================================

  const {
    data: user,
    isLoading: isLoadingUser,
  } = useQuery(getCurrentUser())

  const roles = (user?.roles ?? []).map((role: string) =>
    role.trim().toLowerCase(),
  )

  const isAdmin = roles.includes('admin')

  const isFinanceManager = roles.includes('finance manager')

  const isFinance =
    roles.includes('finance') && !isFinanceManager

  const isManager =
    (
      roles.includes('manager') ||
      roles.includes('project manager')
    ) && !isFinanceManager

  const isApprover =
    isAdmin || isManager || isFinance || isFinanceManager

  const isEmployee = Boolean(user) && !isApprover

  const hasUser = Boolean(user)

  // =====================================================
  // REJECTED NOTIFICATION STORAGE
  // =====================================================

  const rejectedStorageKey = user?.employeeId
    ? `payclaim-dismissed-rejected-${user.employeeId.toLowerCase()}`
    : null

  useEffect(() => {
    if (!rejectedStorageKey) {
      setDismissedRejectedIds([])
      return
    }

    try {
      const stored = window.localStorage.getItem(rejectedStorageKey)
      const parsed: unknown = stored ? JSON.parse(stored) : []

      setDismissedRejectedIds(
        Array.isArray(parsed)
          ? parsed.filter(
              (item): item is string => typeof item === 'string',
            )
          : [],
      )
    } catch {
      setDismissedRejectedIds([])
    }
  }, [rejectedStorageKey])

  const dismissRejectedItems = (ids: string[]) => {
    const updatedIds = Array.from(
      new Set([...dismissedRejectedIds, ...ids]),
    )

    setDismissedRejectedIds(updatedIds)

    if (!rejectedStorageKey) return

    try {
      window.localStorage.setItem(
        rejectedStorageKey,
        JSON.stringify(updatedIds),
      )
    } catch {
      // Notification tetap dihilangkan selama halaman ini terbuka.
    }
  }

  // =====================================================
  // API QUERIES
  // =====================================================

  const {
    data: employeeBenefits = [],
    isLoading: isLoadingBenefits,
  } = useGetAllEmployeeBenefitsQuery(
    hasUser && !isAdmin,
  )

  const dashboardClaimParams = {
    pageNumber: 1,
    pageSize: DASHBOARD_PAGE_SIZE,
  }

  const {
    data: myClaimsResponse,
    isLoading: isLoadingMyClaims,
  } = useGetAllClaimsQuery(
    dashboardClaimParams,
    hasUser,
  )

  const {
    data: adminClaimsResponse,
    isLoading: isLoadingAdminClaims,
  } = useGetAdminAllClaimsQuery(
    dashboardClaimParams,
    isApprover,
  )

  const dashboardProposalParams = {
    pageNumber: 1,
    pageSize: DASHBOARD_PAGE_SIZE,
  }

  const {
    data: proposalResponse,
    isLoading: isLoadingProposals,
  } = useGetAllProposalsQuery(
    dashboardProposalParams,
    isEmployee ? user?.employeeId : undefined,
    hasUser,
  )

  const myClaims = (
    myClaimsResponse?.data ?? []
  ) as DashboardClaim[]

  const allClaims = (
    isApprover
      ? adminClaimsResponse?.data ?? []
      : myClaimsResponse?.data ?? []
  ) as DashboardClaim[]

  const proposals = (
    proposalResponse?.data ?? []
  ) as DashboardProposal[]

  const benefitList =
    employeeBenefits as unknown as DashboardBenefit[]

  // =====================================================
  // DATE
  // =====================================================

  const currentDate = getJakartaDateParts()

  const todayKey =
    `${currentDate.year}-${currentDate.month}-${currentDate.day}`

  const currentDateObject = new Date(
    `${todayKey}T12:00:00+07:00`,
  )

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(currentDateObject)

  // =====================================================
  // PERSONAL CLAIMS
  // =====================================================

  const myAttentionClaims = myClaims.filter(
    (claim) =>
      normalizeStatus(claim.status) === 'needsrevision',
  )

  const myUpdatedClaims = myClaims.filter(
    (claim) =>
      normalizeStatus(claim.status) !== 'rejected' &&
      isUpdatedToday(
        claim.submittedAt,
        getUpdatedAt(claim),
        todayKey,
      ),
  )

  // =====================================================
  // PERSONAL TRIP PROPOSALS
  // =====================================================

  const myProposals = isEmployee
    ? proposals
    : proposals.filter(
        (proposal) =>
          (
            proposal.picEmployeeId &&
            user?.employeeId &&
            proposal.picEmployeeId.toLowerCase() ===
              user.employeeId.toLowerCase()
          ) ||
          (
            proposal.picName &&
            user?.fullName &&
            proposal.picName.trim().toLowerCase() ===
              user.fullName.trim().toLowerCase()
          ),
      )

  const rejectedClaims = myClaims.filter(
    (claim) =>
      normalizeStatus(claim.status) === 'rejected' &&
      !dismissedRejectedIds.includes(`claim:${claim.id}`),
  )

  const rejectedProposals = myProposals.filter(
    (proposal) =>
      normalizeStatus(proposal.status) === 'rejected' &&
      !dismissedRejectedIds.includes(`trip:${proposal.id}`),
  )

  const myAttentionProposals = myProposals.filter(
    (proposal) =>
      normalizeStatus(proposal.status) === 'needsrevision',
  )

  const myUpdatedProposals = myProposals.filter(
    (proposal) =>
      normalizeStatus(proposal.status) !== 'rejected' &&
      isUpdatedToday(
        proposal.submittedAt,
        getUpdatedAt(proposal),
        todayKey,
      ),
  )

  // =====================================================
  // APPROVAL QUEUE
  // =====================================================

  const loggedInEmployeeId = user?.employeeId?.toLowerCase()

  const pendingClaimApprovals = allClaims.filter((claim) => {
    const status = normalizeStatus(claim.status)

    // User cannot approve their own claim.
    if (
      loggedInEmployeeId &&
      claim.employeeId?.toLowerCase() === loggedInEmployeeId
    ) {
      return false
    }

    if (isAdmin) {
      return ['submitted', 'underreview'].includes(status)
    }

    return (
      (isManager && status === 'submitted') ||
      (
        (isFinance || isFinanceManager) &&
        status === 'underreview'
      )
    )
  })

  const pendingTripApprovals = proposals.filter((proposal) => {
    const status = normalizeStatus(proposal.status)

    const isOwnProposal = Boolean(
      (
        proposal.picEmployeeId &&
        user?.employeeId &&
        proposal.picEmployeeId.toLowerCase() ===
          user.employeeId.toLowerCase()
      ) ||
      (
        proposal.picName &&
        user?.fullName &&
        proposal.picName.trim().toLowerCase() ===
          user.fullName.trim().toLowerCase()
      ),
    )

    // PIC cannot approve their own proposal.
    if (isOwnProposal) {
      return false
    }

    if (isAdmin) {
      return [
        'submitted',
        'underreview',
        'financemanagerreview',
      ].includes(status)
    }

    return (
      (isManager && status === 'submitted') ||
      (
        (isFinance || isFinanceManager) &&
        status === 'underreview'
      ) ||
      (
        isFinanceManager &&
        status === 'financemanagerreview'
      )
    )
  })

  // =====================================================
  // TODAY SUMMARY ACTIONS
  // =====================================================

  const todayActions: TodaySummaryAction[] = []

  const addTodayAction = (
    action: TodaySummaryAction,
  ) => {
    if (action.count > 0) {
      todayActions.push(action)
    }
  }

  if (isEmployee) {
    addTodayAction({
      id: 'employee-claims-revision',
      title: 'Claims Need Your Attention',
      description: 'Claims returned or rejected by reviewers.',
      count: myAttentionClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'employee-trip-revision',
      title: 'Trip Proposals Need Your Attention',
      description: 'Trip proposals returned or rejected.',
      count: myAttentionProposals.length,
      to: '/trip-proposals',
    })

    addTodayAction({
      id: 'employee-claim-updates',
      title: 'Your Claims Were Updated',
      description: 'Check the latest changes to your claim status.',
      count: myUpdatedClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'employee-trip-updates',
      title: 'Trip Proposal Updates',
      description: 'Check the latest changes to your proposals.',
      count: myUpdatedProposals.length,
      to: '/trip-proposals',
    })
  } else {
    addTodayAction({
      id: 'approval-claims',
      title: 'Claims Need Your Approval',
      description: 'Employee reimbursement claims awaiting review.',
      count: pendingClaimApprovals.length,
      to: '/approvals/claims',
    })

    addTodayAction({
      id: 'approval-trips',
      title: 'Trip Proposals Need Your Approval',
      description: 'Business trip proposals awaiting your decision.',
      count: pendingTripApprovals.length,
      to: '/approvals/trip-proposals',
    })

    // Personal requests that need attention.
    addTodayAction({
      id: 'personal-claim-revision',
      title: 'Your Claims Need Attention',
      description: 'Your own claims returned or rejected.',
      count: myAttentionClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'personal-trip-revision',
      title: 'Your Trip Proposals Need Attention',
      description: 'Your own trip proposals returned or rejected.',
      count: myAttentionProposals.length,
      to: '/trip-proposals',
    })

    addTodayAction({
      id: 'personal-claim-updates',
      title: 'Your Claims Were Updated',
      description: 'Check changes to your claim status.',
      count: myUpdatedClaims.length,
      to: '/claims',
    })

    addTodayAction({
      id: 'personal-trip-updates',
      title: 'Your Trip Proposals Were Updated',
      description: 'Check changes to your trip proposals.',
      count: myUpdatedProposals.length,
      to: '/trip-proposals',
    })
  }

  // =====================================================
  // RECENT ACTIONS
  // =====================================================

  const uniqueClaims = Array.from(
    new Map(
      [...allClaims, ...myClaims].map((claim) => [
        claim.id,
        claim,
      ]),
    ).values(),
  )

  const myClaimIds = new Set(
    myClaims.map((claim) => claim.id),
  )

  const myProposalIds = new Set(
    myProposals.map((proposal) => proposal.id),
  )

  const recentActions: RecentAction[] = [
    ...uniqueClaims.map((claim): RecentAction => {
      const isOwnClaim = myClaimIds.has(claim.id)

      const activityDate =
        getUpdatedAt(claim) || claim.submittedAt || ''

      return {
        id: claim.id,
        type: 'Claim',
        isOwn: isOwnClaim,
        title:
          claim.benefitName ||
          claim.tripProposalDescription ||
          claim.description ||
          'Reimbursement Claim',
        description: isOwnClaim
          ? `${claim.claimType || 'Reimbursement'} · ${formatDate(claim.transactionDate)}`
          : `${claim.employeeName || 'Employee'} · ${claim.claimType || 'Claim'}`,
        status: claim.status,
        amount: getAmount(claim.amount),
        date: activityDate,
        timestamp: getTimestamp(activityDate),
        href:
          isApprover && !isOwnClaim
            ? `/approvals/claims/${claim.id}`
            : `/claims/${claim.id}`,
      }
    }),

    ...proposals.map((proposal): RecentAction => {
      const isOwnProposal = myProposalIds.has(proposal.id)

      const activityDate =
        getUpdatedAt(proposal) || proposal.submittedAt || ''

      return {
        id: proposal.id,
        type: 'Trip',
        isOwn: isOwnProposal,
        title: proposal.destination || 'Business Trip',
        description: `Business Trip · ${formatDate(proposal.submittedAt)}`,
        status: proposal.status,
        amount: getAmount(proposal.totalAmount),
        date: activityDate,
        timestamp: getTimestamp(activityDate),
        href:
          isApprover && !isOwnProposal
            ? `/approvals/trip-proposals/${proposal.id}`
            : `/trip-proposals/${proposal.id}`,
      }
    }),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  // =====================================================
  // LOADING
  // =====================================================

  const isDashboardLoading =
    isLoadingUser ||
    (
      hasUser &&
      (
        (!isAdmin && isLoadingBenefits) ||
        isLoadingMyClaims ||
        isLoadingProposals ||
        (isApprover && isLoadingAdminClaims)
      )
    )

  // =====================================================
  // QUICK ACCESS
  // =====================================================

  const quickAccessItems: QuickAccessItem[] = []

  if (isEmployee) {
    quickAccessItems.push(
      {
        title: 'Submit a Claim',
        description: 'Create a reimbursement',
        to: '/claims/create',
        icon: Plus,
      },
      {
        title: 'My Claims',
        description: 'Track your claims',
        to: '/claims',
        icon: Receipt,
      },
      {
        title: 'New Trip Proposal',
        description: 'Create a business trip',
        to: '/trip-proposals/create',
        icon: Plane,
      },
      {
        title: 'My Trip Proposals',
        description: 'Manage your trips',
        to: '/trip-proposals',
        icon: FileText,
      },
    )
  } else if (!isAdmin) {
    if (isManager || isFinance) {
      quickAccessItems.push({
        title: 'Claim Approvals',
        description: 'Review employee claims',
        to: '/approvals/claims',
        icon: Receipt,
      })
    }

    quickAccessItems.push(
      {
        title: 'Trip Approvals',
        description: 'Review trip proposals',
        to: '/approvals/trip-proposals',
        icon: Plane,
      },
      {
        title: 'My Claims',
        description: 'Track your personal claims',
        to: '/claims',
        icon: FileText,
      },
      {
        title: 'My Trip Proposals',
        description: 'View your business trips',
        to: '/trip-proposals',
        icon: CalendarDays,
      },
    )
  }

  return {
    user,
    roles,
    isAdmin,
    isApprover,
    isManager,
    isEmployee,
    isDashboardLoading,
    formattedDate,
    todayActions,
    rejectedClaims,
    rejectedProposals,
    dismissRejectedItems,
    quickAccessItems,
    allClaims,
    myClaims,
    proposals,
    benefits: benefitList,
    recentActions,
  }
}