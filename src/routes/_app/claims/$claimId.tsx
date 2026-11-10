import { createFileRoute } from '@tanstack/react-router'
import { ClaimDetailWorkspace } from '#/components/ClaimDetailWorkspace'

export const Route = createFileRoute('/_app/claims/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  return (
    <ClaimDetailWorkspace
      claimId={claimId}
      backTo="/claims"
      backLabel="Back to Claims"
    />
  )
}
