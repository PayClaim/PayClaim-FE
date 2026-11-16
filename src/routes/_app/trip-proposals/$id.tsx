import { createFileRoute } from '@tanstack/react-router'
import { TripProposalDetailWorkspace } from '#/features/trip-proposals/components/TripProposalDetailWorkspace'

export const Route = createFileRoute('/_app/trip-proposals/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <TripProposalDetailWorkspace
      id={id}
      backTo="/trip-proposals"
      backLabel="Back to My Trip Proposals"
    />
  )
}