import { useState } from 'react'
import type { ReactNode } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useGetAllBenefitPlansQuery } from '#/features/benefit-plans/queries/queries'
import type { BenefitPlanFilterParams } from '#/features/benefit-plans/queries/queries'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import { deleteBenefitPlanForm } from '#/features/benefit-plans/forms/forms'
import type { BenefitPlanResponse } from '#/types/benefitPlans.type'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
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
import { FilterSelect } from '#/components/FilterSelect'
import { Layers, Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-react'
import { PaginationSection } from '#/components/PaginationSection'
import { useGetAllBenefitsQuery } from '#/features/benefits/queries/queries'

export const Route = createFileRoute('/_app/admin/benefit-plans/')({
  component: BenefitPlansIndexPage,
  validateSearch: (s) => s as BenefitPlanFilterParams,
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

function BenefitPlansIndexPage() {
  const searchRoute = Route.useSearch()
  const navigate = useNavigate()
  const {
    data: plansResponse,
    isFetching,
    isError,
  } = useGetAllBenefitPlansQuery(searchRoute)
  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const { data: positions = [] } = useGetAllPositionsQuery()
  const { data: benefits } = useGetAllBenefitsQuery()

  const plans = plansResponse?.data || []

  const [searchFilter, setSearchFilter] = useState<string | undefined>(
    searchRoute.search,
  )
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(
    searchRoute.departmentId,
  )
  const [positionFilter, setPositionFilter] = useState<string | undefined>(
    searchRoute.positionId,
  )
  const [benefitFilter, setBenefitFilter] = useState<string | undefined>(
    searchRoute.benefitId,
  )

  const departmentOptions = departments.map((d) => ({
    label: d.name,
    optionValue: d.id,
  }))

  const benefitOptions = benefits.map((b) => ({
    label: b.name,
    optionValue: b.id,
  }))

  const positionOptions = positions.map((p) => ({
    label: p.title,
    optionValue: p.id,
  }))

  const planList: BenefitPlanResponse[] = Array.isArray(plans)
    ? plans
    : ((plans as any)?.data ?? [])

  const hasActiveFilters = Boolean(
    searchFilter || departmentFilter || positionFilter || benefitFilter,
  )

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        search: searchFilter,
        departmentId: departmentFilter,
        positionId: positionFilter,
        benefitId: benefitFilter,
      },
    })
  }

  if (isError) {
    return (
      <main className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Terjadi kesalahan saat memuat data matriks plafon benefit. Silakan
          coba kembali nanti.
        </div>
      </main>
    )
  }

  if (!plansResponse || isFetching) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">
          Memuat data matriks plafon benefit...
        </p>
      </main>
    )
  }
  // if (!plansResponse) return <NotFoundPage />
  const { data, errors, message, statusCode, success, ...paginationProp } =
    plansResponse

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-heading tracking-tight">
                Benefit Plans
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {plansResponse.totalCount}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Matriks plafon batas klaim benefit berdasarkan kombinasi
              Departemen dan Jabatan.
            </p>
          </div>
        </div>

        <Link to="/admin/benefit-plans/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs gap-1.5 h-10 px-4 rounded-lg cursor-pointer">
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Benefit Plan</span>
          </Button>
        </Link>
      </div>

      {/* Table Card Container */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between gap-4 bg-muted/15">
          <div className="flex grow items-center gap-3">
            <div className="relative grow max-w-70 sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search plan or benefit..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-heading placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <FilterSelect
              val={departmentFilter}
              setValue={setDepartmentFilter}
              options={departmentOptions}
              filterLabel="Department"
              nullLabel="All Departments"
              nullable
            />

            <FilterSelect
              val={positionFilter}
              setValue={setPositionFilter}
              options={positionOptions}
              filterLabel="Position"
              nullLabel="All Positions"
              nullable
            />

            <FilterSelect
              val={benefitFilter}
              setValue={setBenefitFilter}
              options={benefitOptions}
              filterLabel="Benefit"
              nullLabel="All Benefits"
              nullable
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchFilter('')
                  setDepartmentFilter(undefined)
                  setPositionFilter(undefined)
                  setBenefitFilter(undefined)
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-9"
              >
                Reset Filter
              </Button>
            )}
          </div>

          <Button onClick={applyFilterClick}>Apply</Button>
        </div>

        {/* Table Content */}
        {planList.length > 0 ? (
          <>
            <BenefitPlansTable plans={planList} />
            <div className="flex justify-between items-center px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Menampilkan {planList.length} dari {plansResponse.totalCount}{' '}
                  total klaim
                </span>
              </div>
              <div className="w-fit grow-0">
                <PaginationSection pagination={paginationProp} />
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center space-y-3">
            <SearchX
              className="w-10 h-10 text-muted-foreground/50 mx-auto"
              strokeWidth={1.5}
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-heading">
                Tidak ada data plafon ditemukan
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Tidak ada aturan plafon yang cocok dengan filter yang dipilih.'
                  : 'Belum ada data aturan plafon benefit yang terdaftar di sistem.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchFilter('')
                  setDepartmentFilter(undefined)
                  setPositionFilter(undefined)
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

function BenefitPlansTable({ plans }: { plans: BenefitPlanResponse[] }) {
  const navigate = useNavigate()
  const thClass =
    'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader className="bg-muted/30 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className={thClass}>DEPARTMENT</TableHead>
            <TableHead className={thClass}>POSITION / ROLE</TableHead>
            <TableHead className={thClass}>BENEFIT TYPE</TableHead>
            <TableHead className={thClass}>LIMIT AMOUNT</TableHead>
            <TableHead className={`${thClass} text-right w-28`}>
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {plans.map((bp) => {
            const key = `${bp.departmentId}_${bp.benefitId}_${bp.positionId}`
            return (
              <TableRow
                key={key}
                className="hover:bg-muted/30 transition-colors border-b border-border/60"
              >
                <TableCell className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-heading">
                      {bp.departmentName || bp.departmentId}
                    </p>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      Code: {bp.departmentId}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4">
                  <div>
                    <p className="font-medium text-heading">
                      {bp.positionTitle || bp.positionId}
                    </p>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      Code: {bp.positionId}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4 font-semibold text-primary">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                    <span>{bp.benefitName || bp.benefitId}</span>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4 font-bold text-heading text-sm">
                  {formatCurrency(bp.limitAmount)}
                </TableCell>

                <TableCell className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 cursor-pointer"
                      title="Edit Plan"
                      onClick={() =>
                        navigate({
                          to: '/admin/benefit-plans/edit',
                          search: {
                            departmentId: bp.departmentId,
                            benefitId: bp.benefitId,
                            positionId: bp.positionId,
                            limitAmount: bp.limitAmount,
                          },
                        })
                      }
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>

                    <DeletePlanDialog plan={bp}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </DeletePlanDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function DeletePlanDialog({
  children,
  plan,
}: {
  children: ReactNode
  plan: BenefitPlanResponse
}) {
  const form = deleteBenefitPlanForm({
    departmentId: plan.departmentId,
    benefitId: plan.benefitId,
    positionId: plan.positionId,
  })

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Aturan Plafon Benefit</DialogTitle>
          <DialogDescription className="text-sm pt-1">
            Apakah Anda yakin ingin menghapus aturan plafon untuk{' '}
            <strong>{plan.benefitName || plan.benefitId}</strong> pada
            departemen{' '}
            <strong>{plan.departmentName || plan.departmentId}</strong> (
            {plan.positionTitle || plan.positionId})?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Batal
            </Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Button variant="destructive" size="sm" type="submit">
              Hapus Plafon
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
