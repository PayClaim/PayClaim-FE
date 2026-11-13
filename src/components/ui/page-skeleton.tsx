import { useEffect, useState } from 'react'

function useDeferredVisibility(delayMs = 200) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  return visible
}

export function ListPageSkeleton() {
  const visible = useDeferredVisibility(200)
  if (!visible) return null

  return (
    <main
      className="space-y-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading content"
    >
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

export function DetailPageSkeleton() {
  const visible = useDeferredVisibility(200)
  if (!visible) return null

  return (
    <main
      className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading details"
    >
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-180">
        {/* Left Summary Pane Skeleton */}
        <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-border p-6 space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-border">
            <div className="h-9 w-9 rounded-lg skeleton-shimmer shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-3/4 rounded skeleton-shimmer" />
              <div className="h-3.5 w-1/2 rounded skeleton-shimmer" />
              <div className="h-6 w-24 rounded-full skeleton-shimmer" />
            </div>
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-24 rounded skeleton-shimmer" />
                <div className="h-4 w-44 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        </aside>

        {/* Right Process Timeline Skeleton */}
        <section className="lg:col-span-8 xl:col-span-9 p-6 lg:p-8 space-y-6 bg-muted/10">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="h-6 w-40 rounded skeleton-shimmer" />
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-md skeleton-shimmer" />
              <div className="h-8 w-24 rounded-md skeleton-shimmer" />
            </div>
          </div>
          <div className="space-y-5">
            {[0, 1, 2].map((card) => (
              <div
                key={card}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-48 rounded skeleton-shimmer" />
                  <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                </div>
                <div className="h-4 w-2/3 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
