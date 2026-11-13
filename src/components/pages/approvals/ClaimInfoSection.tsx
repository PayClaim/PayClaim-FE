import { idNumberFormatter } from '#/lib/formatter'
import { Calendar } from 'lucide-react'
import { useState } from 'react'
import {
  getDescriptionText,
  getInitials,
} from '#/features/approvals/helper/claim-helpers'
import type { Claim } from '#/types/approval-action.type'

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
          <p className="font-semibold text-heading">
            {claim.benefitName ||
              (claim.tripProposalDestination
                ? `Business Trip to ${claim.tripProposalDestination}`
                : claim.tripProposalDescription) ||
              'Operational Expense'}
          </p>
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
