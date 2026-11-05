import { useGetClaimsQuery } from '#/features/claims/queries/getAllClaims'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/claims/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isFetching, isError } = useGetClaimsQuery(claimId)

  if (isFetching) return <p>Loading...</p>
  if (isError) return <p>Error happened</p>

  return (
    <main>
      {claim ? (
        <div>
          <p>{claim.id}</p>
          <p>{claim.amount}</p>
          <p>{claim.benefitName}</p>
          <p>{claim.claimType}</p>
        </div>
      ) : (
        <p>Claim not found</p>
      )}
    </main>
  )
}
