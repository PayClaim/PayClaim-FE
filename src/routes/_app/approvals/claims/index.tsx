import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { useGetAdminAllClaimsQuery } from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'

import { ArrowRight, Receipt } from 'lucide-react'

export const Route = createFileRoute('/_app/approvals/claims/')({
  beforeLoad: ({ context }) => {
    const roles = context.user?.roles || []

    const canView = roles.some((role) =>
      ['Admin', 'Manager', 'Finance', 'Finance Manager'].some(
        (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
      ),
    )

    if (!canView) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function formatDate(date: string) {
  if (!date) return '-'

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getClaimTypeLabel(claimType: string) {
  switch (claimType) {
    case 'OperationalReimbursement':
      return 'Operational Reimbursement'

    case 'BusinessTripReimbursement':
      return 'Business Trip Reimbursement'

    case 'Benefit':
      return 'Benefit Reimbursement'

    default:
      return claimType
  }
}

function getClaimStatusStyle(status: string) {
  switch (status) {
    case 'Submitted':
    case 'UnderReview':
      return 'bg-amber-100 text-amber-700'

    case 'Approved':
    case 'Paid':
      return 'bg-green-100 text-green-700'

    case 'NeedsRevision':
      return 'bg-orange-100 text-orange-700'

    case 'Rejected':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getClaimStatusLabel(status: string) {
  switch (status) {
    case 'UnderReview':
      return 'Under Review'

    case 'NeedsRevision':
      return 'Needs Revision'

    default:
      return status
  }
}

function RouteComponent() {
  const navigate = useNavigate()

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useGetAdminAllClaimsQuery()

  // Array Claim berada di dalam response.data.
  const claims = response?.data ?? []

  return (
    <main className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Receipt size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Approval Claims
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and process employee reimbursement claims.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Claims</p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {response?.totalCount ?? claims.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Waiting for Review
          </p>

          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {
              claims.filter((claim) =>
                ['Submitted', 'UnderReview'].includes(claim.status),
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Approved / Paid
          </p>

          <p className="mt-2 text-2xl font-semibold text-green-600">
            {
              claims.filter((claim) =>
                ['Approved', 'Paid'].includes(claim.status),
              ).length
            }
          </p>
        </div>
      </div>

      {/* Claims Table */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-5">
          <h2 className="font-semibold text-foreground">
            Claim Requests
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a claim to view its details and approval workflow.
          </p>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading claims...
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load claims.'}
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt
              size={36}
              className="mx-auto text-muted-foreground/40"
            />

            <h3 className="mt-3 font-medium text-foreground">
              No claims found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no claims available for review.
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-[1050px] whitespace-nowrap text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">
                    Employee
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Claim Type
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Benefit / Trip
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Transaction Date
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Amount
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Submitted
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4" />
                </tr>
              </thead>

              <tbody>
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() =>
                      navigate({
                        to: '/approvals/claims/$claimId',
                        params: {
                          claimId: claim.id,
                        },
                      })
                    }
                    className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">
                        {claim.employeeName || '-'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {getClaimTypeLabel(claim.claimType)}
                    </td>

                    <td className="max-w-[240px] truncate px-5 py-4">
                      {claim.benefitName ||
                        claim.tripProposalDescription ||
                        'Operational Expense'}
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(claim.transactionDate)}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {idNumberFormatter.format(claim.amount)}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(claim.submittedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${getClaimStatusStyle(
                          claim.status,
                        )}`}
                      >
                        {getClaimStatusLabel(claim.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <ArrowRight
                        size={18}
                        className="ml-auto text-muted-foreground"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}