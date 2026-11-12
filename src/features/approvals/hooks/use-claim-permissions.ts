import { getCurrentUser } from '#/features/auth/queries/queries'
import type { Claim } from '#/types/approval-action.type'
import { useQuery } from '@tanstack/react-query'

export function useClaimPermissions(claim?: Claim | null) {
  const { data: user } = useQuery(getCurrentUser())

  const roles = user?.roles || []
  const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
  const isFinance = roles.some((r) =>
    ['finance', 'finance manager'].includes(r.toLowerCase()),
  )
  const isManager = roles.some((r) => r.toLowerCase() === 'manager')

  const isOwnClaim = Boolean(
    user?.employeeId &&
    claim?.employeeId &&
    user.employeeId === claim.employeeId,
  )

  const status = claim?.status
  const canManagerApprove =
    status === 'Submitted' && (isManager || isAdmin) && !isOwnClaim
  const canFinanceApprove =
    status === 'UnderReview' && (isFinance || isAdmin) && !isOwnClaim

  return {
    showApprovalActions: canManagerApprove || canFinanceApprove,
    canDisburseAndPay: status === 'Approved' && (isFinance || isAdmin),
    canResubmitClaim: status === 'NeedsRevision' && isOwnClaim && !isAdmin,
  }
}
