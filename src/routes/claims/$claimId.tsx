import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/claims/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  return <div>Hello "{claimId}"!</div>
}
