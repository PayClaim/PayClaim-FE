import { Button } from '#/components/ui/button'
import { useGetAllBenefitsQuery } from '#/features/benefits/queries/queries'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { BenefitResponse } from '#/types/benefits.type'
import { Gift, Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { FilterSelect, FilterSelectNumber } from '#/components/FilterSelect'
import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import { deleteBenefitForm } from '#/features/benefits/forms/forms'

export const Route = createFileRoute('/_app/admin/benefits/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: benefits = [], isError, isLoading } = useGetAllBenefitsQuery()
  const { data: categories = [] } = useGetAllCategoriesQuery()
  const [periodFilter, setPeriodFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)
  const [searchFilter, setSearchFilter] = useState<string>('')

  const categoryOptions = categories.map((c) => {
    return { label: c.name, optionValue: c.id }
  })
  const periodOptions = [
    { label: 'Monthly', optionValue: 'Monthly' },
    { label: 'Yearly', optionValue: 'Yearly' },
    { label: 'One Time', optionValue: 'OneTime' },
  ]

  const displayData = benefits.filter((b) => {
    const matchSearch =
      !searchFilter || b.name.toLowerCase().includes(searchFilter.toLowerCase())
    const matchCategory = !categoryFilter || b.categoryId === categoryFilter
    const matchPeriod = !periodFilter || b.periodType === periodFilter

    return matchSearch && matchCategory && matchPeriod
  })

  const hasActiveFilters = Boolean(searchFilter || categoryFilter || periodFilter)

  if (isError) {
    return (
      <main className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Terjadi kesalahan saat memuat data master benefit. Silakan coba kembali nanti.
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat data master benefit...</p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-heading tracking-tight">
                Benefits Master
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {benefits.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Katalog jenis benefit tunjangan klaim karyawan beserta periode dan kategorinya.
            </p>
          </div>
        </div>

        <Link to="/admin/benefits/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs gap-1.5 h-10 px-4 rounded-lg">
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Benefit</span>
          </Button>
        </Link>
      </div>

      {/* Table Card Container */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex flex-wrap items-center justify-between gap-4 bg-muted/15">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search benefit name..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-heading placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <FilterSelect
              val={periodFilter}
              setValue={setPeriodFilter}
              options={periodOptions}
              filterLabel="Period"
              nullable
              nullLabel="All Periods"
            />

            <FilterSelectNumber
              val={categoryFilter}
              setValue={setCategoryFilter}
              options={categoryOptions}
              filterLabel="Category"
              nullable
              nullLabel="All Categories"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchFilter('')
                  setCategoryFilter(null)
                  setPeriodFilter(null)
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Reset Filter
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Showing {displayData.length} of {benefits.length} benefits
          </div>
        </div>

        {/* Table Content */}
        {displayData.length > 0 ? (
          <BenefitTable benefits={displayData} />
        ) : (
          <div className="py-16 text-center space-y-3">
            <SearchX className="w-10 h-10 text-muted-foreground/50 mx-auto" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-heading">Tidak ada data benefit ditemukan</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Tidak ada data benefit yang sesuai dengan kriteria filter saat ini.'
                  : 'Belum ada data jenis benefit yang terdaftar di sistem.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchFilter('')
                  setCategoryFilter(null)
                  setPeriodFilter(null)
                }}
                className="text-xs font-semibold h-8"
              >
                Reset Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function BenefitTable({ benefits }: { benefits: BenefitResponse[] }) {
  const navigate = useNavigate()
  const thClass = 'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader className="bg-muted/30 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className={thClass}>BENEFIT NAME</TableHead>
            <TableHead className={thClass}>CATEGORY</TableHead>
            <TableHead className={thClass}>PERIOD TYPE</TableHead>
            <TableHead className={thClass}>DESCRIPTION</TableHead>
            <TableHead className={`${thClass} text-right w-28`}>ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {benefits.map((b) => (
            <TableRow
              key={b.id}
              className="hover:bg-muted/30 transition-colors border-b border-border/60"
            >
              <TableCell className="px-5 py-4 font-semibold text-heading whitespace-nowrap">
                {b.name}
              </TableCell>

              <TableCell className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {b.categoryName || '-'}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                  {b.periodType}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 text-xs text-muted-foreground max-w-md line-clamp-2">
                {b.description || '-'}
              </TableCell>

              <TableCell className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 cursor-pointer"
                    title="Edit Benefit"
                    onClick={() => {
                      const { id, categoryName, ...rest } = b
                      return navigate({
                        to: '/admin/benefits/$benefitId/edit',
                        params: { benefitId: b.id },
                        search: rest,
                      })
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>

                  <DeleteDialog id={b.id} name={b.name}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 cursor-pointer"
                      title="Delete Benefit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </DeleteDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DeleteDialog({
  children,
  id,
  name,
}: {
  children: ReactNode
  id: string
  name: string
}) {
  const form = deleteBenefitForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Benefit</DialogTitle>
          <DialogDescription className="text-sm pt-1">
            Apakah Anda yakin ingin menghapus benefit <strong>"{name}"</strong>? Data plafon dan riwayat yang terkait akan terpengaruh.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Batal</Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Button variant="destructive" size="sm" type="submit">
              Hapus Benefit
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
