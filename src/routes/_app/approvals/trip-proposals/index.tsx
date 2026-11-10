import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import type { TripProposal } from '#/types/tripProposals.type'

import {
  ArrowRight,
  CalendarDays,
  Plane,
  Users,
} from 'lucide-react'

export const Route = createFileRoute(
  '/_app/approvals/trip-proposals/',
)({
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
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function normalizeStatus(status: string) {
  return status.replace(/[\s_-]/g, '').toLowerCase()
}

function getStatusStyle(status: string) {
  switch (normalizeStatus(status)) {
    case 'submitted':
    case 'underreview':
    case 'financemanagerreview':
      return 'bg-amber-100 text-amber-700'

    case 'approved':
    case 'completed':
      return 'bg-green-100 text-green-700'

    case 'needsrevision':
      return 'bg-orange-100 text-orange-700'

    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getStatusLabel(status: string) {
  switch (normalizeStatus(status)) {
    case 'underreview':
      return 'Under Review'
    case 'financemanagerreview':
      return 'Finance Manager Review'
    case 'needsrevision':
      return 'Needs Revision'
    default:
      return status
  }
}

function ProposalRow({ proposal }: { proposal: TripProposal }) {
  const navigate = useNavigate()

  return (
    <tr
      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
      onClick={() =>
        navigate({
          to: '/approvals/trip-proposals/$id',
          params: { id: proposal.id },
        })
      }
    >
      <td className="px-5 py-4">
        <div className="font-semibold text-foreground">
          {proposal.destination}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Proposal #{proposal.id.slice(0, 8).toUpperCase()}
        </div>
      </td>

      <td className="px-5 py-4 text-foreground">
        {proposal.picName || '-'}
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-foreground">
        <div>{formatDate(proposal.startDate)}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          to {formatDate(proposal.endDate)}
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-4 font-semibold text-foreground">
        {formatCurrency(proposal.totalAmount)}
      </td>

      <td className="px-5 py-4 text-foreground">
        {proposal.participantCount} people
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ${getStatusStyle(
            proposal.status,
          )}`}
        >
          {getStatusLabel(proposal.status)}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <ArrowRight
          size={18}
          className="ml-auto text-muted-foreground"
        />
      </td>
    </tr>
  )
}

function RouteComponent() {
  const {
    data: proposals = [],
    isLoading,
    isError,
    error,
  } = useGetAllProposalsQuery()

  const pendingCount = proposals.filter((proposal) =>
    [
      'submitted',
      'underreview',
      'financemanagerreview',
    ].includes(normalizeStatus(proposal.status)),
  ).length

  const totalParticipants = proposals.reduce(
    (total, proposal) => total + proposal.participantCount,
    0,
  )

  return (
    <main className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <Plane size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Approval Trip Proposals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and process submitted business trip proposals.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Plane size={18} />
            <span className="text-sm">Total Proposals</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {proposals.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <CalendarDays size={18} />
            <span className="text-sm">Waiting for Review</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-amber-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Users size={18} />
            <span className="text-sm">Total Participants</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {totalParticipants}
          </p>
        </div>
      </div>

      {/* Proposal Table */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-5">
          <h2 className="font-semibold text-foreground">
            Trip Proposal Requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a proposal to view its details and approval history.
          </p>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading trip proposals...
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load trip proposals.'}
          </div>
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center">
            <Plane
              className="mx-auto text-muted-foreground/40"
              size={36}
            />
            <h3 className="mt-3 font-medium text-foreground">
              No trip proposals found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              There are currently no trip proposals available for review.
            </p>
          </div>
        ) : (
          <div className="w-full min-w-0 max-w-full overflow-x-auto">
            <table className="w-full min-w-[1050px] whitespace-nowrap text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">Destination</th>
                  <th className="px-5 py-4 font-medium">PIC</th>
                  <th className="px-5 py-4 font-medium">Trip Period</th>
                  <th className="px-5 py-4 font-medium">Total Amount</th>
                  <th className="px-5 py-4 font-medium">Participants</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>

              <tbody>
                {proposals.map((proposal) => (
                  <ProposalRow
                    key={proposal.id}
                    proposal={proposal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}