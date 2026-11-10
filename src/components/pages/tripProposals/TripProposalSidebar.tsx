import type { TripProposalDetailResponse } from '#/types/tripProposals.type'

import { Badge } from '#/components/ui/badge'

type Props = {
  proposal: TripProposalDetailResponse
}

export function TripProposalSidebar({ proposal }: Props) {
  return (
    <aside className="space-y-5">
      {/* Informasi perjalanan. */}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="border-b border-border pb-3 text-sm font-bold">
          Trip Information
        </h2>

        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Description
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {proposal.description || 'No description provided.'}
          </p>
        </div>
      </section>

      {/* Daftar peserta dibuat compact agar tetap rapi hingga 10 orang. */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold">
            Participants
          </h2>

          <Badge variant="outline">
            {proposal.participants.length}
          </Badge>
        </div>

        <div className="divide-y divide-border">
          {proposal.participants.map((participant) => (
            <div
              key={participant.employeeId}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {participant.employeeName || 'Unknown Employee'}
                  </p>

                  {participant.isPic && (
                    <Badge color="info">
                      PIC
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {participant.employeeNumber || '-'}
                </p>
              </div>

              <p className="shrink-0 text-right text-xs font-semibold">
                {formatCurrency(participant.amount)}
              </p>
            </div>
          ))}

          {proposal.participants.length === 0 && (
            <p className="py-5 text-center text-xs text-muted-foreground">
              No participants found.
            </p>
          )}
        </div>
      </section>
    </aside>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}