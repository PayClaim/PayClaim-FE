import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import type { TripProposalDetailResponse } from '#/types/tripProposals.type'

import {
  Badge,
  getTripProposalBadgeColor,
} from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

type Props = {
  proposal: TripProposalDetailResponse
  backTo?: string
  backLabel?: string
}

export function TripProposalHeader({
  proposal,
  backTo = '/trip-proposals',
  backLabel = 'Back to My Trip Proposals',
}: Props) {
  const isAccommodationPaid = [
    'financemanagerreview',
    'approved',
    'completed',
  ].includes((proposal.status || '').replace(/[\s_-]/g, '').toLowerCase())

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      {/* Judul, informasi submit, dan status. */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link to={backTo}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              title={backLabel}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Business Trip to {proposal.destination}
            </h1>

            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Proposal #{proposal.id.slice(0, 8).toUpperCase()}
              {' · '}
              Submitted {formatSubmittedAt(proposal.submittedAt)}
            </p>
          </div>
        </div>

        {/* Status tanpa kotak tambahan. */}
        <div className="shrink-0 sm:text-right">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Approval Status
          </p>

          <Badge
            variant="default"
            color={getTripProposalBadgeColor(proposal.status)}
            className="px-4 py-1.5 text-sm font-semibold"
          >
            {getStatusLabel(proposal.status)}
          </Badge>
        </div>
      </div>

      {/* Ringkasan perjalanan. */}
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem
          label="Start Date"
          value={formatDate(proposal.startDate)}
        />

        <SummaryItem
          label="End Date"
          value={formatDate(proposal.endDate)}
        />

        <SummaryItem
          label="Accommodation Amount (Hotel, Ticket)"
          value={
            isAccommodationPaid ? (
              <span>
                {formatCurrency(proposal.accommodationAmount)}{' '}
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  (PAID)
                </span>
              </span>
            ) : (
              formatCurrency(proposal.accommodationAmount)
            )
          }
        />

        <SummaryItem
          label="Total Amount"
          value={formatCurrency(proposal.totalAmount)}
          highlight
        />
      </div>
    </section>
  )
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 text-base font-bold ${
          highlight ? 'text-primary' : ''
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function getStatusLabel(status: string) {
  const norm = (status || '').replace(/[\s_-]/g, '').toLowerCase()

  switch (norm) {
    case 'submitted':
      return 'Pending Manager'
    case 'underreview':
      return 'Pending Finance'
    case 'financemanagerreview':
      return 'Pending Finance Manager'
    case 'approved':
      return 'Approved'
    case 'completed':
      return 'Completed'
    case 'needsrevision':
      return 'Needs Revision'
    case 'rejected':
      return 'Rejected'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function parseDateUtc(value: string): Date | null {
  if (!value) return null
  const hasTz = /[Zz]$|[+-]\d{2}(:\d{2})?$/.test(value)
  const d = new Date(hasTz ? value : `${value}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatSubmittedAt(value: string) {
  const date = parseDateUtc(value)
  if (!date) return '-'

  const formattedDate = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })

  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).replace('.', ':')

  return `${formattedDate} at ${formattedTime}`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}