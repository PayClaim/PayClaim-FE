import { Button } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/benefits/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="bg-card p-4 rounded-2xl">
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold">My Benefit</h1>
        <Link to="/claims/create">
          <Button className="bg-primary">New Claim</Button>
        </Link>
      </div>
    </main>
  )
}
