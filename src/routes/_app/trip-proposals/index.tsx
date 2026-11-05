import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/trip-proposals/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/trip-proposals/"!</div>
}
