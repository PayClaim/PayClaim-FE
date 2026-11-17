import { createFileRoute } from '@tanstack/react-router'

import { useDashboardData } from '#/features/dashboard/hooks/useDashboardData'
import { DashboardSections } from '#/components/pages/dashboard/dashboardSections'

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const dashboard = useDashboardData()

  if (dashboard.isDashboardLoading) {
    return (
      <main className="space-y-5">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      </main>
    )
  }

  if (!dashboard.user) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-semibold text-foreground">
          User information could not be loaded.
        </p>
      </div>
    )
  }

  return (
    <DashboardSections
      summary={{
        userName:
          dashboard.user.fullName?.split(' ')[0] || 'there',
        formattedDate: dashboard.formattedDate,
        todayActions: dashboard.todayActions,
        isEmployee: dashboard.isEmployee,
        rejectedClaims: dashboard.rejectedClaims,
        rejectedProposals: dashboard.rejectedProposals,
        onDismissRejected: dashboard.dismissRejectedItems,
        quickAccessItems: dashboard.quickAccessItems,
        isAdmin: dashboard.isAdmin,
      }}
      analytics={{
        isApprover: dashboard.isApprover,
        isManager: dashboard.isManager,
        allClaims: dashboard.allClaims,
        proposals: dashboard.proposals,
      }}
      personal={{
        isAdmin: dashboard.isAdmin,
        benefits: dashboard.benefits,
        myClaims: dashboard.myClaims,
        recentActions: dashboard.recentActions,
        roles: dashboard.roles,
      }}
    />
  )
}