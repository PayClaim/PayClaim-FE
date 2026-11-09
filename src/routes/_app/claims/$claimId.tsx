import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { useGetClaimsQuery } from '#/features/claims/queries/queries'
import type { ClaimTypeEnum } from '#/types/claims.type'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/claims/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isFetching, isError, error } = useGetClaimsQuery(claimId)

  const cardHeaderClass = 'text-lg font-semibold'
  const rowClass =
    'grid grid-cols-[140px_1fr] gap-3 py-2 border-b border-border last:border-b-0'

  if (isFetching) return <p>Loading...</p>
  if (isError || !claim) return <p>Error happened: {error?.message}</p>

  return (
    <main>
      <div className="my-4">
        <div>
          <Link to="/claims" className="underline">
            Claim
          </Link>
          <span> / {claim.id}</span>
        </div>
        <div>
          <DisplayHeader type={claim.claimType} value={claim.benefitName} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-md">
          <CardHeader>
            <h2 className={cardHeaderClass}>Claim Information</h2>
          </CardHeader>
          <CardContent>
            <div className={rowClass}>
              <span>Id</span>
              <span>{claim.id}</span>
            </div>
            <p>{claim.amount}</p>
            <p>{claim.benefitName}</p>
            <p>{claim.claimType}</p>
            <p>{claim.filePath}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className={cardHeaderClass}>Approval History</h2>
          </CardHeader>
          <CardContent>
            <div>{claim.id}</div>
            <p>{claim.amount}</p>
            <p>{claim.benefitName}</p>
            <p>{claim.claimType}</p>
            <p>{claim.filePath}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className={cardHeaderClass}>Employee Information</h2>
          </CardHeader>
          <CardContent>
            <p>{claim.id}</p>
            <p>{claim.amount}</p>
            <p>{claim.benefitName}</p>
            <p>{claim.claimType}</p>
            <p>{claim.filePath}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function DisplayHeader({
  type,
  value,
}: {
  type: ClaimTypeEnum
  value: string
}) {
  const h1Class = 'text-xl font-bold'
  switch (type) {
    case 'Benefit':
      return <h1 className={h1Class}>Benefit Claim : {value}</h1>
    case 'BusinessTripReimbursement':
      return <h1 className={h1Class}>Trip Reimbursement Claim : {value}</h1>
    case 'OperationalReimbursement':
      return (
        <h1 className={h1Class}>Operational Reimbursement Claim : {value}</h1>
      )
  }
}
