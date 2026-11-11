import { createFileRoute } from '@tanstack/react-router'
import { TripProposalDetailWorkspace } from '#/components/pages/tripProposals/TripProposalDetailWorkspace'

export const Route = createFileRoute('/_app/approvals/trip-proposals/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <TripProposalDetailWorkspace
      id={id}
      backTo="/approvals/trip-proposals"
      backLabel="Back to Approval Trip Proposals"
    />
  )
}