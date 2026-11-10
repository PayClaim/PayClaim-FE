import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClaimDetailWorkspace } from '#/components/ClaimDetailWorkspace'

export const Route = createFileRoute('/_app/approvals/$claimId')({
  beforeLoad: ({ context }) => {
    const roles = context.user?.roles || []
    const canView = roles.some((r) =>
      ['Admin', 'Manager', 'Finance', 'Finance Manager'].some(
        (role) => role.toLowerCase() === r.toLowerCase(),
      ),
    )
    if (!canView) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  return (
    <ClaimDetailWorkspace
      claimId={claimId}
      backTo="/approvals"
      backLabel="Back to Approvals"
    />
  )
}
