import { getClaimBadgeClass } from '#/components/ui/badge'

interface StatusBadgeProps {
  status: string
  label: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const sizing = size === 'sm' ? 'px-2.5' : 'px-3'
  const dot = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  return (
    <span
      className={`inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 ${sizing} py-1 rounded-md text-xs font-semibold border ${getClaimBadgeClass(status)}`}
    >
      <span className={`${dot} rounded-full bg-current`} />
      {label}
    </span>
  )
}
