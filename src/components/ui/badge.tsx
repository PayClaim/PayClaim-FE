import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Slot } from 'radix-ui'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-white',
        outline: 'border-border text-foreground',
        ghost: 'hover:bg-accent text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

function getClaimBadgeClass(status: string) {
  switch (status?.toUpperCase()) {
    case 'SUBMITTED':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300'
    case 'UNDERREVIEW':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300'
    case 'NEEDSREVISION':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300'
    case 'APPROVED':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300'
    case 'PAID':
      return 'bg-green-600/20 text-green-800 dark:text-green-300 border-green-400 font-bold'
    case 'REJECTED':
      return 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-300'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getTripProposalBadgeColor(status: string) {
  switch (status?.toUpperCase()) {
    case 'SUBMITTED':
      return '#00ffff'
    case 'UNDERREVIEW':
      return '#ffff00'
    case 'APPROVED':
      return '#00ff00'
    case 'REJECTED':
      return '#ff0000'
    case 'COMPLETED':
      return '#bbbbbb'
    case 'CANCELLED':
      return '#ff0000'
    default:
      return '#000000'
  }
}

export { Badge, badgeVariants, getClaimBadgeClass, getTripProposalBadgeColor }
