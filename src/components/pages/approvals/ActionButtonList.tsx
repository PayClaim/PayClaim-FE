import { Button } from '#/components/ui/button'
import type { ClaimResponseWithHistory } from '#/types/claims.type'
import { Link, useRouteContext } from '@tanstack/react-router'
import { CheckCircle2, DollarSign, Edit, XCircle } from 'lucide-react'

interface Props {
  setActionType: (
    s: 'Approved' | 'Rejected' | 'NeedsRevision' | 'Pay' | null,
  ) => void
  setOpen: (s: boolean) => void
  claim: ClaimResponseWithHistory
}
export function ActionButtonList({ setActionType, setOpen, claim }: Props) {
  const { user } = useRouteContext({ from: '/_app' })
  const roles = user.roles

  const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
  const isFinance = roles.some((r) =>
    ['finance', 'finance manager'].includes(r.toLowerCase()),
  )
  const isManager = roles.some((r) => r.toLowerCase() === 'manager')

  // Validasi kepemilikan klaim
  const isOwnClaim = Boolean(
    user.employeeId && claim.employeeId && user.employeeId === claim.employeeId,
  )
  const canManagerApprove =
    claim.status === 'Submitted' && (isManager || isAdmin) && !isOwnClaim

  const canFinanceApprove =
    claim.status === 'UnderReview' && (isFinance || isAdmin) && !isOwnClaim

  const canDisburseAndPay =
    claim.status === 'Approved' && (isFinance || isAdmin)

  const showApprovalActions = canManagerApprove || canFinanceApprove

  // Tombol Edit & Resubmit khusus pemilik klaim saat status NeedsRevision
  const canResubmitClaim =
    claim.status === 'NeedsRevision' && (isOwnClaim || isAdmin)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canResubmitClaim && (
        <Link to="/claims/$claimId/edit" params={{ claimId: claim.id }}>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-xs">
            <Edit className="h-4 w-4" /> Edit & Resubmit Claim
          </Button>
        </Link>
      )}

      {showApprovalActions && (
        <>
          <Button
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/30"
            onClick={() => {
              setActionType('NeedsRevision')
              setOpen(true)
            }}
          >
            Request Revision
          </Button>
          <Button
            variant="destructive"
            className="gap-1.5"
            onClick={() => {
              setActionType('Rejected')
              setOpen(true)
            }}
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            onClick={() => {
              setActionType('Approved')
              setOpen(true)
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            {claim.status === 'Submitted'
              ? 'Approve (Manager)'
              : 'Approve (Finance)'}
          </Button>
        </>
      )}

      {canDisburseAndPay && (
        <Button
          className="bg-green-700 hover:bg-green-800 text-white gap-1.5 shadow-xs"
          onClick={() => {
            setActionType('Pay')
            setOpen(true)
          }}
        >
          <DollarSign className="h-4 w-4" /> Disburse & Mark Paid
        </Button>
      )}
    </div>
  )
}
