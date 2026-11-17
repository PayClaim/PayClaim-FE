import { Button } from '#/components/ui/button'
import { DetailPageSkeleton } from '#/components/ui/page-skeleton'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function ClaimLoadingState() {
  return <DetailPageSkeleton />
}

interface ClaimErrorStateProps {
  backTo: string
  backLabel: string
  message: string
}

export function ClaimErrorState({ backTo, backLabel, message }: ClaimErrorStateProps) {
  return (
    <main className="w-full max-w-[1600px] mx-auto space-y-4">
      <Link to={backTo}>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
        </Button>
      </Link>
      <div className="bg-card p-8 rounded-xl border border-destructive text-destructive">
        Failed to load claim details: {message}
      </div>
    </main>
  )
}
