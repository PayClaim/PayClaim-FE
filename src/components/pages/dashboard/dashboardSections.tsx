import { DashboardSummary } from '#/components/pages/dashboard/dashboardSummary'
import type { DashboardSummaryProps } from '#/components/pages/dashboard/dashboardSummary'

import { DashboardAnalytics } from '#/components/pages/dashboard/dashboardAnalytics'
import type { DashboardAnalyticsProps } from '#/components/pages/dashboard/dashboardAnalytics'

import { DashboardPersonal } from '#/components/pages/dashboard/dashboardPersonal'
import type { DashboardPersonalProps } from '#/components/pages/dashboard/dashboardPersonal'

type DashboardSectionsProps = {
  summary: DashboardSummaryProps
  analytics: DashboardAnalyticsProps
  personal: DashboardPersonalProps
}

export function DashboardSections({
  summary,
  analytics,
  personal,
}: DashboardSectionsProps) {
  return (
    <main className="min-w-0 space-y-5">
      <DashboardSummary {...summary} />

      <DashboardAnalytics {...analytics} />

      <DashboardPersonal {...personal} />
    </main>
  )
}