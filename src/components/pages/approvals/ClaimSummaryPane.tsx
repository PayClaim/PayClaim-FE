import { ClaimInfoSection } from './ClaimInfoSection'
import { ClaimSummaryHeader } from './ClaimSummaryHeader'
import { ReceiptAttachmentCard } from './ReceiptAttachmentCard'
import {
  formatDateBox,
  getClaimTypeLabel,
  getStatusDisplayLabel,
} from '#/features/approvals/helper/claim-helpers'
import type { Claim, ReceiptInfo } from '#/types/approval-action.type'

interface ClaimSummaryPaneProps {
  claim: Claim
  receipt: ReceiptInfo
  backTo: string
  backLabel: string
  onPreview: () => void
}

/** Panel kiri: ringkasan klaim, info detail, dan thumbnail lampiran. */
export function ClaimSummaryPane({
  claim,
  receipt,
  backTo,
  backLabel,
  onPreview,
}: ClaimSummaryPaneProps) {
  return (
    <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-start bg-card">
      <ClaimSummaryHeader
        claim={claim}
        backTo={backTo}
        backLabel={backLabel}
        submittedLongDate={formatDateBox(claim.submittedAt).longDate}
        statusLabel={getStatusDisplayLabel(claim.status)}
        hasReceipt={receipt.hasFile}
        onPreview={onPreview}
      />
      <ClaimInfoSection
        claim={claim}
        claimTypeLabel={getClaimTypeLabel(claim.claimType)}
        transactionLongDate={formatDateBox(claim.transactionDate).longDate}
      />
      <div className="p-6 space-y-3">
        <ReceiptAttachmentCard
          claim={claim}
          receipt={receipt}
          onPreview={onPreview}
        />
      </div>
    </aside>
  )
}
