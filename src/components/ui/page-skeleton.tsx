export function ListPageSkeleton() {
  return (
    <main className="space-y-6" aria-busy="true" aria-label="Loading content">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded-md skeleton-shimmer" />
          <div className="h-4 w-72 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-9 w-36 rounded-lg skeleton-shimmer" />
      </div>

      {/* 3 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded skeleton-shimmer" />
              <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
            </div>
            <div className="h-7 w-16 rounded skeleton-shimmer" />
            <div className="h-3.5 w-36 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="h-3.5 w-64 rounded skeleton-shimmer" />
          </div>
          <div className="h-9 w-56 rounded-lg skeleton-shimmer" />
        </div>
        <div className="divide-y divide-border">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="h-4 w-48 rounded skeleton-shimmer" />
              <div className="h-4 w-24 rounded skeleton-shimmer" />
              <div className="h-6 w-20 rounded-full skeleton-shimmer" />
              <div className="h-4 w-24 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
