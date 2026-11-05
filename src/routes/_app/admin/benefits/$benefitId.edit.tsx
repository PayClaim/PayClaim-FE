import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/benefits/$benefitId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/admin/benefits/edit"!</div>
}
