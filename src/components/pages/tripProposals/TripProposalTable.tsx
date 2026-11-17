
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import type { TripProposal } from '#/types/tripProposals.type'

import {
  formatTripProposalCurrency,
  formatTripProposalDate,
  getTripProposalInitials,
} from '#/features/trip-proposals/utils/tripProposalUtils'

import { TripProposalStatusBadge } from '#/components/pages/tripProposals/TripProposalStatusBadge'

import {
  ArrowRight,
  Calendar,
  FileText,
  Users,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { api } from '#/lib/api-client'
import {
  markRecordCardSource,
  viewTransitionNavOptions,
} from '#/lib/view-transition'

type Props = {
  proposals: TripProposal[]
  totalProposals: number
  searchQuery: string
  activeTab: string
}

export function TripProposalTable({
  proposals,
  totalProposals,
  searchQuery,
  activeTab,
}: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const hasActiveFilters = Boolean(
    searchQuery.trim() || activeTab !== 'ALL',
  )

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Trip Period</th>
              <th className="px-5 py-3">PIC</th>
              <th className="px-5 py-3">Participants</th>
              <th className="px-5 py-3 text-right">Total Cost</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {proposals.map((proposal) => (
              <tr
                key={proposal.id}
                onMouseEnter={() => {
                  void queryClient.prefetchQuery({
                    queryKey: ['trip-proposals', proposal.id],
                    queryFn: () => api.get(`/trip-proposals/${proposal.id}`),
                    staleTime: 30_000,
                  })
                }}
                onClick={(event) => {
                  markRecordCardSource(event.currentTarget)
                  navigate({
                    to: '/trip-proposals/$id',
                    params: { id: proposal.id },
                    ...viewTransitionNavOptions(),
                  })
                }}
                className="row-enter group cursor-pointer transition-colors hover:bg-muted/40"
              >
                {/* DESTINATION */}
                <td className="min-w-[180px] px-5 py-3.5">
                  <div className="max-w-[240px] truncate text-sm font-semibold whitespace-nowrap text-foreground">
                    {proposal.destination}
                  </div>
                </td>

                {/* TRIP PERIOD */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />

                    <span>
                      {formatTripProposalDate(proposal.startDate)}
                    </span>

                    <span className="text-muted-foreground">–</span>

                    <span>
                      {formatTripProposalDate(proposal.endDate)}
                    </span>
                  </div>
                </td>

                {/* PIC */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getTripProposalInitials(proposal.picName)}
                    </div>

                    <span className="text-xs font-medium text-foreground">
                      {proposal.picName || '-'}
                    </span>
                  </div>
                </td>

                {/* PARTICIPANTS */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1.5 rounded-md border-border bg-muted/40 px-2.5 py-1 text-xs font-medium"
                  >
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />

                    {proposal.participantCount} {proposal.participantCount === 1 ? 'Person' : 'People'}
                  </Badge>
                </td>

                {/* TOTAL AMOUNT */}
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <span className="text-sm font-semibold tracking-tight text-foreground tabular-nums">
                    {formatTripProposalCurrency(proposal.totalAmount)}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                  <TripProposalStatusBadge status={proposal.status} />
                </td>

                {/* ACTION */}
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                    <span>Detail</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </td>
              </tr>
            ))}

            {proposals.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />

                    <p className="font-medium">
                      No trip proposals found
                    </p>

                    <p className="text-xs text-muted-foreground/80">
                      {hasActiveFilters
                        ? 'Try changing your search keywords or status tab.'
                        : 'You are not registered in any business trip proposals yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
        <span>
          Showing {proposals.length} of {totalProposals} total proposals
        </span>

        {activeTab !== 'ALL' && (
          <span className="font-medium text-foreground">
            Active filter: {activeTab}
          </span>
        )}
      </div>
    </section>
  )
}
