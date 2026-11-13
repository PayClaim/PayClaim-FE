import { api } from '#/lib/api-client'
import { idNumberFormatter } from '#/lib/formatter'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import {
  getDescriptionText,
  getInitials,
} from '#/features/approvals/helper/claim-helpers'
import type { Claim } from '#/types/approval-action.type'
import type { TripProposal } from '#/types/tripProposals.type'

const DESCRIPTION_LIMIT = 140

function InfoField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground block mb-0.5">
        {label}
      </span>
      {children}
    </div>
  )
}

interface ClaimInfoSectionProps {
  claim: Claim
  claimTypeLabel: string
  transactionLongDate: string
}

export function ClaimInfoSection({
  claim,
  claimTypeLabel,
  transactionLongDate,
}: ClaimInfoSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const [showTripDetail, setShowTripDetail] = useState(false)

  const { data: tripDetail, isLoading: isLoadingTrip } = useQuery({
    queryKey: ['trip-proposal-hover', claim.tripProposalId],
    queryFn: async () => {
      const res = await api.get<TripProposal | { data: TripProposal }>(
        `/trip-proposals/${claim.tripProposalId}`,
      )
      return 'data' in res ? res.data : res
    },
    enabled: Boolean(claim.tripProposalId) && showTripDetail,
  })

  const descriptionText = getDescriptionText(claim)
  const isLong = descriptionText.length > DESCRIPTION_LIMIT

  return (
    <div className="p-6 border-b border-border space-y-4">
      <h3 className="text-base font-bold text-heading">Claim Info</h3>

      <div className="space-y-3.5 text-sm">
        <InfoField label="Claimant Name">
          <div className="flex items-center gap-2.5 mt-0.5">
            <div
              className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {getInitials(claim.employeeName)}
            </div>
            <div>
              <p className="font-semibold text-heading leading-tight">
                {claim.employeeName}
              </p>
              <p className="text-xs text-muted-foreground">
                {claim.employeeNumber}
                {claim.departmentName ? ` • ${claim.departmentName}` : ''}
              </p>
            </div>
          </div>
        </InfoField>

        <InfoField label="Claim Type">
          <p className="font-semibold text-heading">{claimTypeLabel}</p>
        </InfoField>

        <InfoField label="Benefit / Trip Reference">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-heading">
              {claim.benefitName ||
                (claim.tripProposalDestination
                  ? `Business Trip to ${claim.tripProposalDestination}`
                  : claim.tripProposalDescription) ||
                'Operational Expense'}
            </p>

            {claim.tripProposalId && (
              <div
                className="relative inline-block"
                onMouseEnter={() => setShowTripDetail(true)}
                onMouseLeave={() => setShowTripDetail(false)}
              >
                <Link
                  to="/trip-proposals/$id"
                  params={{ id: claim.tripProposalId }}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 cursor-pointer transition-colors"
                >
                  Detail
                </Link>

                {showTripDetail && (
                  <div className="absolute left-0 top-full pt-1.5 z-50">
                    <Link
                      to="/trip-proposals/$id"
                      params={{ id: claim.tripProposalId }}
                      className="block w-72 rounded-xl border border-border bg-popover p-3.5 text-xs shadow-lg space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                    {isLoadingTrip ? (
                      <p className="text-muted-foreground">Loading trip details...</p>
                    ) : tripDetail ? (
                      <>
                        <div className="border-b border-border pb-1.5">
                          <p className="font-bold text-heading text-sm">
                            {tripDetail.destination}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {tripDetail.startDate} – {tripDetail.endDate}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                              Estimated Budget
                            </span>
                            <span className="font-semibold text-heading">
                              {idNumberFormatter.format(tripDetail.totalAmount ?? 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                              Status
                            </span>
                            <span className="font-semibold text-heading">
                              {tripDetail.status}
                            </span>
                          </div>
                        </div>
                        {tripDetail.description && (
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                              Purpose
                            </span>
                            <p className="text-heading/90 line-clamp-2">
                              {tripDetail.description}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Trip details unavailable.</p>
                    )}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </InfoField>

        <InfoField label="Amount Requested">
          <p className="text-base font-extrabold text-primary">
            {idNumberFormatter.format(claim.amount)}
          </p>
        </InfoField>

        <InfoField label="Date of Transaction">
          <div className="flex items-center gap-2 font-semibold text-heading">
            <Calendar
              className="h-4 w-4 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <span>{transactionLongDate}</span>
          </div>
        </InfoField>

        <InfoField label="Notes">
          <p className="text-xs text-heading/90 leading-relaxed whitespace-pre-wrap">
            {isLong && !expanded
              ? `${descriptionText.slice(0, DESCRIPTION_LIMIT)}... `
              : descriptionText}
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="text-primary font-semibold hover:underline ml-1"
              >
                {expanded ? 'Show Less' : 'View More'}
              </button>
            )}
          </p>
        </InfoField>
      </div>
    </div>
  )
}
