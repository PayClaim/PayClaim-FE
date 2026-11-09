import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/trip-proposals/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">My Claims</h1>
        <Link to="/claims/create">
          <Button className="bg-primary">New Claim</Button>
        </Link>
      </div>
      <div className="bg-card p-8 rounded-2xl mb-8  border border-border">
        hello trip proposals
      </div>
    </main>
  )
}
