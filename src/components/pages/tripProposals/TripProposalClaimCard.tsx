import { Link } from '@tanstack/react-router'

type Props = {
  proposalId: string
  canClaim: boolean
  hasRemainingBudget: boolean
  totalBudget: number
  remainingBudget: number
  claimedAmount: number
  formatCurrency: (amount: number) => string
}

export function TripProposalClaimCard({
  proposalId,
  canClaim,
  hasRemainingBudget,
  totalBudget,
  remainingBudget,
  claimedAmount,
  formatCurrency,
}: Props) {
  if (!canClaim) return null

  if (hasRemainingBudget) {
    return (
      <Link
        to="/claims/create"
        search={{
          tripProposalId: proposalId,
          claimType: 'BusinessTripReimbursement',
        }}
        className="group block"
      >
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-100/70 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:hover:border-emerald-700">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                Reimbursement Claim Submission
              </span>

              <span className="inline-flex items-center rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                Available
              </span>
            </div>

            <p className="mt-0.5 text-xs text-emerald-700/90 dark:text-emerald-300/90">
              {claimedAmount > 0 ? (
                <>
                  Your remaining budget:{' '}
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">
                    {formatCurrency(remainingBudget)}
                  </span>

                  <span className="ml-1 text-[11px] text-emerald-700/70 dark:text-emerald-300/70">
                    (Total: {formatCurrency(totalBudget)}, Claimed:{' '}
                    {formatCurrency(claimedAmount)})
                  </span>
                </>
              ) : (
                <>
                  Your budget limit:{' '}
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">
                    {formatCurrency(totalBudget)}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center self-end sm:shrink-0 sm:self-center">
            <span className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all group-hover:bg-emerald-700 group-hover:shadow-xs group-active:scale-95">
              Submit Claim ({formatCurrency(remainingBudget)})
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            Reimbursement Claim Submission
          </span>

          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            Budget Exhausted
          </span>
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Your entire trip budget limit (
          {formatCurrency(totalBudget)}) has been claimed.
        </p>
      </div>

      <div className="self-end text-xs font-medium text-muted-foreground sm:shrink-0 sm:self-center">
        Budget Fully Used
      </div>
    </div>
  )
}