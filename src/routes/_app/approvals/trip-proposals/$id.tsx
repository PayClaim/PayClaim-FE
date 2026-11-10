import { createFileRoute, redirect } from '@tanstack/react-router'
import { TripProposalDetailWorkspace } from '#/components/pages/tripProposals/TripProposalDetailWorkspace'

export const Route = createFileRoute(
  '/_app/approvals/trip-proposals/$id',
)({
  beforeLoad: ({ context }) => {
    const roles = context.user?.roles || []

    const canView = roles.some((role) =>
      ['Admin', 'Manager', 'Finance', 'Finance Manager'].some(
        (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
      ),
    )

    if (!canView) {
      throw redirect({ to: '/dashboard' })
    }
  },
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
