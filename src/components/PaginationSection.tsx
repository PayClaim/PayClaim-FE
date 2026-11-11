import type { PaginationProps } from '#/types/pagination.type'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  pagination: PaginationProps
}

export function PaginationSection({ pagination }: Props) {
  const navigate = useNavigate()
  const toPage = async (page: number) =>
    await navigate({
      to: '.' as const,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ['pageNumber']: page,
      }),
    })

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        {pagination.hasPreviousPage && (
          <PaginationItem>
            <div
              className="border border-transparent hover:border-border p-2 rounded-full flex justify-center hover:bg-accent/10"
              aria-disabled
              onClick={() => toPage(pagination.pageNumber - 1)}
            >
              <ChevronLeft size={20} className="mr-1" />
            </div>
          </PaginationItem>
        )}

        {pagination.pageNumber - 2 > 0 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* One number below active */}
        {pagination.pageNumber - 1 > 0 && (
          <PaginationItem>
            <PaginationLink onClick={() => toPage(pagination.pageNumber - 1)}>
              {pagination.pageNumber - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* current page */}
        <PaginationItem>
          <PaginationLink isActive>{pagination.pageNumber}</PaginationLink>
        </PaginationItem>

        {/* One number higher */}
        {pagination.pageNumber !== pagination.totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => toPage(pagination.pageNumber + 1)}>
              {pagination.pageNumber + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Has two or more page */}
        {pagination.pageNumber + 2 <= pagination.totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next page */}
        {pagination.hasNextPage && (
          <PaginationItem>
            <div
              className="border border-transparent hover:border-border p-2 rounded-full flex justify-center hover:bg-accent/10"
              aria-disabled
              onClick={() => toPage(pagination.pageNumber + 1)}
            >
              <ChevronRight size={20} />
            </div>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
