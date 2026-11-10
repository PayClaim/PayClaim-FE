import { LoadingComponent } from '#/components/ErrorAndLoading'
import { ActionButtonList } from '#/components/pages/approvals/ActionButtonList'
import { ActionDialog } from '#/components/pages/approvals/ActionDialog'
import { HeaderSection } from '#/components/pages/approvals/Header'
import { Button } from '#/components/ui/button'
import {
  useApproveClaimMutation,
  useGetClaimsQuery,
  usePayClaimMutation,
  useRejectClaimMutation,
} from '#/features/claims/queries/queries'
import { createFileRoute, Link, useRouteContext } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/playground/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isFetching, isError, error } = useGetClaimsQuery(claimId)
  const { user } = useRouteContext({ from: '/_app' })

  const [notes, setNotes] = useState('')
  const [actionType, setActionType] = useState<
    'Approved' | 'Rejected' | 'NeedsRevision' | 'Pay' | null
  >(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (isFetching) return <LoadingComponent pageTitle="Claim Details" />

  if (isError || !claim) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link to="/claims">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Claims
          </Button>
        </Link>
        <div className="bg-card p-8 rounded-2xl border border-destructive text-destructive">
          Error: {error ? error.message : 'Claim not found.'}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <HeaderSection claim={claim} />

        {/* Action Buttons Container */}
        <ActionButtonList
          claim={claim}
          setActionType={setActionType}
          setOpen={setDialogOpen}
        />
      </div>
      <ActionDialog
        key={actionType}
        actionType={actionType}
        claimId={claimId}
        claimStatus={claim.status}
        open={dialogOpen}
        setOpen={setDialogOpen}
      />
    </main>
  )
}
