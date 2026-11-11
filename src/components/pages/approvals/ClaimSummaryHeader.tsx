import { Button } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Eye, Flag } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Claim } from '#/types/approval-action.type'

interface ClaimSummaryHeaderProps {
  claim: Claim
  backTo: string
  backLabel: string
  submittedLongDate: string
  statusLabel: string
  hasReceipt: boolean
  onPreview: () => void
}

export function ClaimSummaryHeader({
  claim,
  backTo,
  backLabel,
  submittedLongDate,
  statusLabel,
  hasReceipt,
  onPreview,
}: ClaimSummaryHeaderProps) {
  return (
    <div className="p-6 border-b border-border space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-heading hover:text-primary transition-colors"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border bg-muted/40">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>{backLabel}</span>
        </Link>

        {hasReceipt && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5"
            onClick={onPreview}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Preview
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-heading">
            CLAIM #{claim.id.slice(0, 8).toLowerCase()}
          </h2>
          <Flag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
          Submitted on {submittedLongDate}
        </p>

        <div className="pt-1">
          <StatusBadge status={claim.status} label={statusLabel} size="sm" />
        </div>
      </div>
    </div>
  )
}
