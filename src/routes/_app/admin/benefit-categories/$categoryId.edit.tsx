import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/admin/benefit-categories/$categoryId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/admin/benefit-categories/$categoryId/edit"!</div>
}
