import { ClaimDetailWorkspace } from '#/components/pages/approvals/ClaimDetailWorkspace'
import { LoadingComponent } from '#/components/ErrorAndLoading'
import { Button } from '#/components/ui/button'
import { useGetClaimsQuery } from '#/features/claims/queries/queries'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/playground/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isFetching, isError, error } = useGetClaimsQuery(claimId)

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
    <div>
      <ClaimDetailWorkspace
        claimId={claimId}
        backLabel="Back to Claim"
        backTo="/claims"
      />
    </div>
  )
}
