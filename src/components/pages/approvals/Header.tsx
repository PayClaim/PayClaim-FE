import { getClaimBadgeClass } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { toDateTimeString } from '#/lib/utils'
import type { ClaimResponseWithHistory } from '#/types/claims.type'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function HeaderSection({ claim }: { claim: ClaimResponseWithHistory }) {
  return (
    <div className="flex items-center gap-3">
      <Link to="/approvals">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Claim #{claim.id.slice(0, 8)}
          </h1>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getClaimBadgeClass(
              claim.status,
            )}`}
          >
            {claim.status === 'UnderReview'
              ? 'Under Review (Finance)'
              : claim.status === 'Approved'
                ? 'Approved (Pending Payment)'
                : claim.status === 'NeedsRevision'
                  ? 'Needs Revision'
                  : claim.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Submitted on{' '}
          {claim.submittedAt
            ? toDateTimeString(new Date(claim.submittedAt))
            : '-'}
        </p>
      </div>
    </div>
  )
}
