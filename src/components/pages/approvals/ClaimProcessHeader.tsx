import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, DollarSign, Edit, XCircle } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { ActionType, Claim } from '#/types/approval-action.type'

interface ClaimProcessHeaderProps {
  claim: Claim
  statusLabel: string
  canResubmitClaim: boolean
  showApprovalActions: boolean
  canDisburseAndPay: boolean
  onAction: (type: ActionType) => void
}

export function ClaimProcessHeader({
  claim,
  statusLabel,
  canResubmitClaim,
  showApprovalActions,
  canDisburseAndPay,
  onAction,
}: ClaimProcessHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-extrabold text-heading">Claim Process</h1>
        <StatusBadge status={claim.status} label={statusLabel} size="md" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canResubmitClaim && (
          <Link to="/claims/$claimId/edit" params={{ claimId: claim.id }}>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5"
            >
              <Edit className="h-4 w-4" aria-hidden="true" /> Edit & Resubmit
              Claim
            </Button>
          </Link>
        )}

        {showApprovalActions && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border text-heading hover:bg-muted font-semibold"
              onClick={() => onAction('NeedsRevision')}
            >
              Request Revision
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40 font-semibold gap-1.5"
              onClick={() => onAction('Rejected')}
            >
              <XCircle className="h-4 w-4" aria-hidden="true" /> Reject
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
              onClick={() => onAction('Approved')}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {claim.status === 'Submitted'
                ? 'Approve (Manager)'
                : 'Approve (Finance)'}
            </Button>
          </>
        )}

        {canDisburseAndPay && (
          <Button
            type="button"
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1.5"
            onClick={() => onAction('Pay')}
          >
            <DollarSign className="h-4 w-4" aria-hidden="true" /> Disburse &
            Mark Paid
          </Button>
        )}
      </div>
    </div>
  )
}
