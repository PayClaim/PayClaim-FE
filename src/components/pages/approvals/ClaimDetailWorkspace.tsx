import { useGetClaimsQuery } from '#/features/claims/queries/queries'
import { useState } from 'react'
import { ClaimActionDialog } from './ClaimActionDialog'
import { ClaimErrorState, ClaimLoadingState } from './ClaimDetailState'
import { ClaimProcessHeader } from './ClaimProcessHeader'
import { ClaimProcessTimeline } from './ClaimProcessTimeline'
import { ClaimSummaryPane } from './ClaimSummaryPane'
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog'
import { RevisionBanner } from '#/components/pages/approvals/RevisionBanner'
import {
  getReceiptInfo,
  getStatusDisplayLabel,
} from '#/features/approvals/helper/claim-helpers'
import { useClaimActions } from '#/features/approvals/hooks/use-claim-actions'
import { useClaimPermissions } from '#/features/approvals/hooks/use-claim-permissions'

interface ClaimDetailWorkspaceProps {
  claimId: string
  backTo?: string
  backLabel?: string
}

export function ClaimDetailWorkspace({
  claimId,
  backTo = '/claims',
  backLabel = 'Back to Claims',
}: ClaimDetailWorkspaceProps) {
  const {
    data: claim,
    isPending,
    isFetching,
    isError,
    error,
  } = useGetClaimsQuery(claimId)
  const permissions = useClaimPermissions(claim)
  const actions = useClaimActions(claimId)
  const [previewOpen, setPreviewOpen] = useState(false)

  if (isPending || (!claim && isFetching)) return <ClaimLoadingState />

  if (isError || !claim) {
    return (
      <ClaimErrorState
        backTo={backTo}
        backLabel={backLabel}
        message={error ? error.message : 'Claim record was not found.'}
      />
    )
  }

  const receipt = getReceiptInfo(claim.filePath)
  const openPreview = () => setPreviewOpen(true)

  return (
    <main className="w-full max-w-[1600px] mx-auto space-y-4">
      {claim.status === 'NeedsRevision' && permissions.canResubmitClaim && (
        <RevisionBanner />
      )}

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-180">
        <ClaimSummaryPane
          claim={claim}
          receipt={receipt}
          backTo={backTo}
          backLabel={backLabel}
          onPreview={openPreview}
        />

        <section className="lg:col-span-8 xl:col-span-9 p-6 lg:p-8 space-y-6 bg-muted/10">
          <ClaimProcessHeader
            claim={claim}
            statusLabel={getStatusDisplayLabel(claim.status)}
            canResubmitClaim={permissions.canResubmitClaim}
            showApprovalActions={permissions.showApprovalActions}
            canDisburseAndPay={permissions.canDisburseAndPay}
            onAction={actions.openAction}
          />
          <ClaimProcessTimeline
            claim={claim}
            receipt={receipt}
            onPreview={openPreview}
          />
        </section>
      </div>

      <ReceiptPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        receipt={receipt}
        employeeName={claim.employeeName}
      />

      <ClaimActionDialog
        claim={claim}
        open={actions.dialogOpen}
        onOpenChange={actions.setDialogOpen}
        actionType={actions.actionType}
        notes={actions.notes}
        onNotesChange={actions.setNotes}
        onConfirm={actions.confirmAction}
        isPending={actions.isPending}
      />
    </main>
  )
}
