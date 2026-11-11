import { createFileRoute, redirect } from '@tanstack/react-router'

import { ClaimDetailWorkspace } from '#/components/pages/approvals/ClaimDetailWorkspace'

export const Route = createFileRoute('/_app/approvals/claims/$claimId')({
  beforeLoad: ({ context }) => {
    const roles = context.user.roles

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
  const { claimId } = Route.useParams()

  return (
    <ClaimDetailWorkspace
      claimId={claimId}
      backTo="/approvals/claims"
      backLabel="Back to Approval Claims"
    />
  )
}
