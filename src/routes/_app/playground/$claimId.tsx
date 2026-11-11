import { ClaimDetailWorkspace } from '#/components/pages/playground/ClaimDetailWorkspace'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/playground/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
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
