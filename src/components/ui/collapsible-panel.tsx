import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '#/lib/utils'

type CollapsiblePanelProps = {
  title: ReactNode
  children: ReactNode
  /** Konten di sisi kanan header (tombol aksi, badge, dsb). */
  actions?: ReactNode
  defaultOpen?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

/**
 * Panel dengan animasi buka/tutup memakai trik grid 0fr -> 1fr,
 * sehingga tinggi konten tidak perlu diukur manual (tanpa JS layout read).
 */
export function CollapsiblePanel({
  title,
  children,
  actions,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <section className={cn('min-w-0', className)}>
      <div
        className={cn(
          'flex items-center justify-between gap-2',
          headerClassName,
        )}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group/panel-toggle flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="min-w-0 flex-1 truncate font-bold">{title}</span>

          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <div
        id={panelId}
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        className="collapsible-panel-grid"
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'collapsible-panel-content',
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
