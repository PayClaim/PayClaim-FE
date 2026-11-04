import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <main>
      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>Trip</CardHeader>
            <CardContent>
              <div>To: Somewhere</div>
              <div>Claimable allowance: $100</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>Latest Claim</CardHeader>
            <CardContent>
              Nomor klaim, jenis (benefit, trip, biasa), nominal, status, posisi
              approval saat ini
            </CardContent>
          </Card>
          <Card>This is card</Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <p
                  key={i}
                  className="border-b border-border py-2 last:border-0"
                >
                  Benefit {i}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card>This is card</Card>
        </div>
      </div>
    </main>
  )
}
