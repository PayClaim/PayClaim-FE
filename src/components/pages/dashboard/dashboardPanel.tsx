import type { ReactNode } from 'react'

import type { PeriodFilter } from '#/types/dashboard.type'

export function DashboardPanel({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2">
        <h2 className="min-w-0 text-base font-semibold text-foreground">
          {title}
        </h2>

        {action}
      </div>

      <div className="min-w-0 p-5 pt-3">{children}</div>
    </section>
  )
}

export function PeriodFilterSelect({
  value,
  onChange,
}: {
  value: PeriodFilter
  onChange: (value: PeriodFilter) => void
}) {
  return (
    <select
      aria-label="Filter period"
      value={value}
      onChange={(event) =>
        onChange(event.target.value as PeriodFilter)
      }
      className="h-8 max-w-36 cursor-pointer rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-foreground outline-none transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
    >
      <option value="month">This Month</option>
      <option value="sixMonths">Last 6 Months</option>
      <option value="year">This Year</option>
      <option value="all">All Time</option>
    </select>
  )
}