import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Claim } from '#/types/approval-action.type'

interface ClaimSummaryHeaderProps {
  claim: Claim
  backTo: string
  backLabel: string
  submittedLongDate: string
  statusLabel: string
}

export function ClaimSummaryHeader({
  claim,
  backTo,
  backLabel,
  submittedLongDate,
  statusLabel,
}: ClaimSummaryHeaderProps) {
  const normalizedClaimType = String(claim.claimType)
    .replace(/[\s_-]/g, '')
    .toLowerCase()

  const claimReferenceId = claim.id.slice(0, 4).toLowerCase()

  const claimTitle =
    normalizedClaimType === 'operationalreimbursement'
      ? `Operational Reimbursement #${claimReferenceId}`
      : normalizedClaimType === 'businesstripreimbursement'
        ? claim.tripProposalDestination?.trim()
          ? `Business Trip to ${claim.tripProposalDestination.trim()}`
          : claim.tripProposalDescription?.trim() ||
            'Business Trip Reimbursement'
        : claim.benefitName?.trim() || 'Benefit Reimbursement'

  return (
    <div className="border-b border-border p-6 space-y-4">
      <div className="flex items-start gap-3">
        {/* Back Button */}
        <Link
          to={backTo}
          aria-label={backLabel}
          title={backLabel}
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-heading transition-all hover:bg-muted hover:text-primary active:scale-[0.97]"
        >
          <ArrowLeft className="-ml-0.5 h-4 w-4" aria-hidden="true" />
        </Link>

        {/* Claim Information */}
        <div className="min-w-0 space-y-2">
          <div className="flex items-start gap-2">
            <h2 className="break-words text-balance text-2xl font-extrabold leading-tight tracking-tight text-heading">
              {claimTitle}
            </h2>
          </div>

          <p className="text-xs text-muted-foreground">
            Submitted on {submittedLongDate}
          </p>

          <StatusBadge
            status={claim.status}
            label={statusLabel}
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}