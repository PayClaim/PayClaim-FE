import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'
import type { ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      duration={5000}
      visibleToasts={4}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          '--toast-close-button-start': 'auto',
          '--toast-close-button-end': '12px',
          '--toast-close-button-transform': 'none',
        } as React.CSSProperties
      }
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'w-full max-w-[380px] p-4 pr-12 rounded-xl border shadow-lg flex items-center gap-3 relative font-sans text-sm tracking-normal transition-all pointer-events-auto bg-card text-foreground border-border',
          title: 'font-medium text-sm leading-normal text-current',
          description: 'text-xs text-muted-foreground mt-0.5 leading-relaxed',
          actionButton:
            'bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-lg text-xs',
          cancelButton:
            'bg-muted text-muted-foreground px-3 py-1.5 rounded-lg text-xs',
          closeButton:
            'absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-current transition-colors cursor-pointer border-0 p-0',
          error:
            '!bg-rose-50 dark:!bg-rose-950/90 !text-rose-950 dark:!text-rose-100 !border-rose-300 dark:!border-rose-800 shadow-rose-500/10',
          success:
            '!bg-emerald-50 dark:!bg-emerald-950/90 !text-emerald-950 dark:!text-emerald-100 !border-emerald-300 dark:!border-emerald-800 shadow-emerald-500/10',
          warning:
            '!bg-amber-50 dark:!bg-amber-950/90 !text-amber-950 dark:!text-amber-100 !border-amber-300 dark:!border-amber-800 shadow-amber-500/10',
          info:
            '!bg-sky-50 dark:!bg-sky-950/90 !text-sky-950 dark:!text-sky-100 !border-sky-300 dark:!border-sky-800 shadow-sky-500/10',
        },
      }}
      icons={{
        success: (
          <CircleCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ),
        info: (
          <InfoIcon className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="w-5 h-5 animate-spin text-primary shrink-0" />
        ),
        close: <XIcon className="w-3.5 h-3.5" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
