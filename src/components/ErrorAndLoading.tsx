export function ErrorComponent({
  pageTitle,
  error,
}: {
  pageTitle: string
  error?: any
}) {
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">{pageTitle}</h1>
      <div className="bg-card p-8 rounded-2xl border border-destructive text-destructive">
        Failed to load claims. Please ensure backend connection is active.
        <span>{error}</span>
      </div>
    </main>
  )
}
export function LoadingComponent({ pageTitle }: { pageTitle: string }) {
  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{pageTitle}</h1>
      </div>
      <div className="bg-card p-8 rounded-2xl border border-border">
        <p>Loading claims data...</p>
      </div>
    </main>
  )
}
