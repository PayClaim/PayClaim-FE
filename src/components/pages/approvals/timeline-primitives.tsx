import { CheckCircle2, Clock, Eye, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  formatDateBox,
  getInitials,
} from '#/features/approvals/helper/claim-helpers'

export type StageTone = 'success' | 'danger' | 'warning'

const NODE_TONE_CLASS: Record<StageTone, string> = {
  success:
    'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400',
  danger:
    'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-400',
  warning:
    'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-400',
}

const NODE_ICON: Record<StageTone, typeof Clock> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: Clock,
}

interface TimelineStageProps {
  title: string
  statusBadge?: ReactNode
  tone: StageTone
  /** Garis penghubung ke tahap di bawahnya. */
  connector?: boolean
  approverName: string
  showViewButton: boolean
  onView: () => void
  children: ReactNode
}

/** Kerangka satu tahap timeline: node status, garis, kartu, dan header. */
export function TimelineStage({
  title,
  statusBadge,
  tone,
  connector = true,
  approverName,
  showViewButton,
  onView,
  children,
}: TimelineStageProps) {
  const Icon = NODE_ICON[tone]

  return (
    <div className="relative">
      {connector && (
        <div
          className="absolute -left-6 top-7 h-[calc(100%+1.5rem)] w-0.5 bg-border pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div
        className={`absolute -left-10 top-3 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${NODE_TONE_CLASS[tone]}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-heading">{title}</h2>
            {statusBadge}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span
                className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center"
                aria-hidden="true"
              >
                {getInitials(approverName)}
              </span>
              <span>{approverName}</span>
            </div>
            {showViewButton && (
              <button
                type="button"
                onClick={onView}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs font-semibold text-heading hover:bg-muted transition-colors"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
              </button>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}

/** Layout isi kartu: kotak tanggal di kiri, konten di kanan. */
export function StageBody({
  date,
  children,
}: {
  date?: string | null
  children: ReactNode
}) {
  const dBox = formatDateBox(date)

  return (
    <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
      <div className="w-full sm:w-28 shrink-0 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900 p-3 text-center">
        <div className="text-2xl font-extrabold text-sky-950 dark:text-sky-200 leading-none">
          {dBox.day}
        </div>
        <div className="text-xs text-sky-800 dark:text-sky-300 mt-1 pb-2 border-b border-sky-200 dark:border-sky-800">
          {dBox.monthYear}
        </div>
        <div className="text-xs font-semibold text-sky-950 dark:text-sky-200 pt-1.5">
          {dBox.time}
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">{children}</div>
    </div>
  )
}

export function StageIconBadge({ icon: Icon }: { icon: typeof Clock }) {
  return (
    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
  )
}

interface ChecklistRowProps {
  dotClass: string
  label: ReactNode
  truncate?: boolean
  children: ReactNode
}

export function ChecklistRow({
  dotClass,
  label,
  truncate,
  children,
}: ChecklistRowProps) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
      <div
        className={`flex items-center gap-2 font-semibold text-heading ${truncate ? 'min-w-0' : ''}`}
      >
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} />
        {label}
      </div>
      {children}
    </div>
  )
}

export function NotesBox({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
      <span className="text-xs text-muted-foreground block">{label}</span>
      <p className="text-xs font-medium text-heading leading-relaxed whitespace-pre-wrap">
        {children}
      </p>
    </div>
  )
}
