
import {
  createFileRoute,
  Link,
  redirect,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'

import { useMyTripProposals } from '#/features/trip-proposals/hooks/useTripProposalList'

import {
  TripProposalMetrics,
} from '#/features/trip-proposals/components/TripProposalMetrics'

import {
  TripProposalTable,
} from '#/features/trip-proposals/components/TripProposalTable'

import { Button } from '#/components/ui/button'

import {
  Plus,
  Search,
  X,
} from 'lucide-react'

// =====================================================
// ROUTE
// =====================================================

export const Route = createFileRoute('/_app/trip-proposals/')({
  beforeLoad: ({ context }) => {
    if (context.isAdmin || context.isDirector) {
      throw redirect({ to: '/dashboard' })
    }
  },

  component: RouteComponent,
})

// =====================================================
// PAGE COMPONENT
// =====================================================

function RouteComponent() {
  const { data: user } = useQuery(getCurrentUser())

  const {
    data: proposalResponse,
    isError,
    isFetching,
    error,
  } = useGetAllProposalsQuery(undefined, user?.employeeId)

  const proposals = proposalResponse?.data ?? []

  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    metrics,
    sortedProposals,
} = useMyTripProposals(proposals)

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-card p-8 text-center">
        <p className="font-semibold text-rose-600">
          Failed to load business trip proposals.
        </p>

        <p className="text-xs text-muted-foreground">
          {error instanceof Error
            ? error.message
            : 'Unknown error'}
        </p>
      </div>
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (isFetching && proposals.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p className="text-sm">
          Loading your business trip proposals...
        </p>
      </div>
    )
  }

  // =====================================================
  // PAGE UI
  // =====================================================

  return (
    <main className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            My Trip Proposals
          </h1>

          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage and track your business trip proposals (as PIC or participant).
          </p>
        </div>

        <Link to="/trip-proposals/create">
          <Button
            size="sm"
            className="h-9 cursor-pointer gap-1.5 bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Submit New Proposal
          </Button>
        </Link>
      </div>

      {/* KPI SUMMARY */}
      <TripProposalMetrics metrics={metrics} />

      {/* PROPOSALS TABLE */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* TABLE TOOLBAR */}
        <div className="flex min-w-0 flex-col gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Riwayat Proposal
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Pilih proposal untuk melihat timeline persetujuan, daftar peserta,
              dan dokumen pendukung.
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
            {/* STATUS TABS */}
            <div className="flex w-fit max-w-full min-w-0 shrink-0 flex-nowrap overflow-x-auto whitespace-nowrap rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-card font-semibold text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('WAITING')}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'WAITING'
                    ? 'bg-card font-semibold text-amber-600 shadow-2xs dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Waiting Review
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('APPROVED')}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'APPROVED'
                    ? 'bg-card font-semibold text-blue-600 shadow-2xs dark:text-blue-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Approved
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('COMPLETED')}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'COMPLETED'
                    ? 'bg-card font-semibold text-emerald-600 shadow-2xs dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Completed
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('REVISION_OR_REJECTED')}
                className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'REVISION_OR_REJECTED'
                    ? 'bg-card font-semibold text-rose-600 shadow-2xs dark:text-rose-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Revision / Rejected
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-full sm:ml-auto sm:w-64">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search destination, PIC..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-border bg-muted/40 py-1.5 pr-8 pl-8.5 text-xs transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/40 focus:outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <TripProposalTable
          proposals={sortedProposals}
          totalProposals={proposals.length}
          searchQuery={searchQuery}
          activeTab={activeTab}
        />
      </section>
    </main>
  )
}
