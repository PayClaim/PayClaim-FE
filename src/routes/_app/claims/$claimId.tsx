import { useGetClaimsQuery } from '#/features/claims/queries/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/claims/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isFetching, isError, error } = useGetClaimsQuery(claimId)

  if (isFetching) return <p>Loading...</p>
  if (isError) return <p>Error happened: {error.message}</p>

  return (
    <main>
      {claim ? (
        <div>
          <p>{claim.id}</p>
          <p>{claim.amount}</p>
          <p>{claim.benefitName}</p>
          <p>{claim.claimType}</p>
          <p>{claim.filePath}</p>
        </div>
      ) : (
        <p>Claim not found</p>
      )}
    </main>
  )
}
