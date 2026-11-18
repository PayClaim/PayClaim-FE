
import { useEffect, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

const adminPageLabels: Record<string, string> = {
  'benefit-categories': 'Benefit Categories',
  'benefit-plans': 'Benefit Plans',
  benefits: 'Benefits',
  departments: 'Departments',
  employees: 'Employees',
  'reset-password': 'Reset Password',
}

const adminEntityLabels: Record<string, string> = {
  'benefit-categories': 'Benefit Category',
  'benefit-plans': 'Benefit Plan',
  benefits: 'Benefit',
  departments: 'Department',
  employees: 'Employee',
}

function formatSegment(segment: string) {
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function isRecordId(segment: string) {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment,
    ) || /^\d+$/.test(segment)
  )
}

function appendDetailSegments(
  items: BreadcrumbItem[],
  segments: string[],
  basePath: string,
  entityLabel: string,
) {
  for (const segment of segments) {
    if (segment === 'create' || segment === 'new') {
      items.push({
        label: `New ${entityLabel}`,
      })
      continue
    }

    if (segment === 'edit') {
      items.push({
        label: `Edit ${entityLabel}`,
      })
      continue
    }

    if (segment.endsWith('_edit')) {
      const recordId = segment.slice(0, -5)

      if (recordId) {
        items.push({
          label: `${entityLabel} Details`,
          to: `${basePath}/${recordId}`,
        })
      }

      items.push({
        label: `Edit ${entityLabel}`,
      })
      continue
    }

    if (isRecordId(segment)) {
      items.push({
        label: `${entityLabel} Details`,
        to: `${basePath}/${segment}`,
      })
      continue
    }

    items.push({
      label: formatSegment(segment),
    })
  }
}

function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)

  if (segments.length === 0 || segments[0] === 'dashboard') {
    return [
      { label: 'General' },
      { label: 'Dashboard' },
    ]
  }

  const section = segments[0]
  const remainingSegments = segments.slice(1)

  // My Claims
  if (section === 'claims') {
    const items: BreadcrumbItem[] = [
      { label: 'Reimbursement & Trips' },
      { label: 'My Claims', to: '/claims' },
    ]

    appendDetailSegments(
      items,
      remainingSegments,
      '/claims',
      'Claim',
    )

    return items
  }

  // My Trip Proposals
  if (section === 'trip-proposals') {
    const items: BreadcrumbItem[] = [
      { label: 'Reimbursement & Trips' },
      { label: 'My Trip Proposals', to: '/trip-proposals' },
    ]

    appendDetailSegments(
      items,
      remainingSegments,
      '/trip-proposals',
      'Trip Proposal',
    )

    return items
  }

  // Approvals
  if (section === 'approvals') {
    // Approvals dibuat non-clickable.
    // Supaya tidak kembali ke halaman default Approval Claims.
    const items: BreadcrumbItem[] = [
      { label: 'Approvals' },
    ]

    if (remainingSegments.length === 0) {
      return items
    }

    const approvalType = remainingSegments[0]

    const approvalLabels: Record<string, string> = {
      claims: 'Claims',
      'trip-proposals': 'Trip Proposals',
    }

    const pageLabel =
      approvalLabels[approvalType] || formatSegment(approvalType)

    const basePath = `/approvals/${approvalType}`

    items.push({
      label: pageLabel,
      to: basePath,
    })

    appendDetailSegments(
      items,
      remainingSegments.slice(1),
      basePath,
      approvalType === 'claims' ? 'Claim' : 'Trip Proposal',
    )

    return items
  }

  // My Benefits
  if (section === 'benefits') {
    const items: BreadcrumbItem[] = [
      { label: 'Benefits' },
      { label: 'My Benefits', to: '/benefits' },
    ]

    appendDetailSegments(
      items,
      remainingSegments,
      '/benefits',
      'Benefit',
    )

    return items
  }

  // Administration
  if (section === 'admin') {
    const items: BreadcrumbItem[] = [
      { label: 'Administration', to: '/admin' },
    ]

    if (remainingSegments.length === 0) {
      return items
    }

    const adminPage = remainingSegments[0]

    const adminLabel =
      adminPageLabels[adminPage] || formatSegment(adminPage)

    const basePath = `/admin/${adminPage}`

    items.push({
      label: adminLabel,
      to: basePath,
    })

    appendDetailSegments(
      items,
      remainingSegments.slice(1),
      basePath,
      adminEntityLabels[adminPage] || 'Record',
    )

    return items
  }

  // Fallback
  const items: BreadcrumbItem[] = [
    { label: formatSegment(section), to: `/${section}` },
  ]

  appendDetailSegments(
    items,
    remainingSegments,
    `/${section}`,
    'Record',
  )

  return items
}

export default function Breadcrumb() {
  const breadcrumbRef = useRef<HTMLElement | null>(null)

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const items = getBreadcrumbItems(pathname)
  const currentIndex = items.length - 1

  // Jika breadcrumb terlalu panjang, arahkan scroll
  // ke halaman aktif agar bagian terakhir tetap terlihat.
  useEffect(() => {
    const breadcrumb = breadcrumbRef.current

    if (breadcrumb) {
      breadcrumb.scrollLeft = breadcrumb.scrollWidth
    }
  }, [pathname])

  return (
    <nav
      ref={breadcrumbRef}
      aria-label="Breadcrumb"
      className="
        min-w-0 flex-1 overflow-x-auto
        overscroll-x-contain
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      <ol className="flex w-max min-w-full items-center gap-1.5 whitespace-nowrap text-sm">
        {items.map((item, index) => {
          const isCurrent = index === currentIndex

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex shrink-0 items-center gap-1.5"
            >
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                  strokeWidth={1.75}
                />
              )}

              {item.to && !isCurrent ? (
                <Link
                  to={item.to as never}
                  className="
                    cursor-pointer select-none
                    whitespace-nowrap
                    text-muted-foreground
                    transition-colors duration-150
                    hover:text-primary
                  "
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`
                    cursor-default select-none
                    whitespace-nowrap
                    transition-colors duration-150
                    ${
                      isCurrent
                        ? 'font-semibold text-heading'
                        : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
