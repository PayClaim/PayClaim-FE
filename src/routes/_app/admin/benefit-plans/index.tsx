import { useState } from 'react'
import type { ReactNode } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useGetAllBenefitPlansQuery } from '#/features/benefit-plans/queries/queries'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import { deleteBenefitPlanForm } from '#/features/benefit-plans/forms/forms'
import type { BenefitPlanResponse } from '#/types/benefitPlans.type'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { SearchFilter } from '#/components/SearchFilter'
import { Pencil, Trash, Layers } from 'lucide-react'

export const Route = createFileRoute('/_app/admin/benefit-plans/')({
  component: BenefitPlansIndexPage,
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

function BenefitPlansIndexPage() {
  const { data: plans = [], isLoading, isError } = useGetAllBenefitPlansQuery()
  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const { data: positions = [] } = useGetAllPositionsQuery()

  const [searchFilter, setSearchFilter] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [positionFilter, setPositionFilter] = useState<string | null>(null)

  const departmentOptions = departments.map((d) => ({
    label: d.name,
    optionValue: d.id,
  }))

  const positionOptions = positions.map((p) => ({
    label: p.title,
    optionValue: p.id,
  }))

  const displayData = plans.filter((bp) => {
    const s = searchFilter.toLowerCase()
    const matchSearch =
      !searchFilter ||
      bp.benefitName?.toLowerCase().includes(s) ||
      bp.departmentName?.toLowerCase().includes(s) ||
      bp.positionTitle?.toLowerCase().includes(s) ||
      bp.departmentId.toLowerCase().includes(s) ||
      bp.positionId.toLowerCase().includes(s)

    const matchDept = !departmentFilter || bp.departmentId === departmentFilter
    const matchPos = !positionFilter || bp.positionId === positionFilter

    return matchSearch && matchDept && matchPos
  })

  if (isError) {
    return (
      <div className="p-4 text-destructive font-semibold">
        Terjadi kesalahan saat memuat data matriks plafon benefit.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat data matriks plafon benefit...</p>
      </div>
    )
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">Benefit Plans</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Matriks plafon batas klaim benefit berdasarkan kombinasi Departemen dan Jabatan.
          </p>
        </div>

        <Link to="/admin/benefit-plans/create">
          <Button className="bg-primary font-bold shadow-xs">
            New Benefit Plan
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />

          <FilterSelect
            val={departmentFilter}
            setValue={setDepartmentFilter}
            options={departmentOptions}
            filterLabel="Departemen"
            nullLabel="Semua Departemen"
            nullable
          />

          <FilterSelect
            val={positionFilter}
            setValue={setPositionFilter}
            options={positionOptions}
            filterLabel="Jabatan"
            nullLabel="Semua Jabatan"
            nullable
          />
        </div>

        {/* Table Content */}
        <BenefitPlansTable plans={displayData} />
      </div>
    </main>
  )
}

function BenefitPlansTable({ plans }: { plans: BenefitPlanResponse[] }) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/20">
            <TableHead className="font-bold text-xs py-3.5">DEPARTEMEN</TableHead>
            <TableHead className="font-bold text-xs py-3.5">JABATAN / POSISI</TableHead>
            <TableHead className="font-bold text-xs py-3.5">JENIS BENEFIT</TableHead>
            <TableHead className="font-bold text-xs py-3.5">PLAFON / LIMIT</TableHead>
            <TableHead className="font-bold text-xs py-3.5 text-center w-28">AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((bp) => {
            const key = `${bp.departmentId}_${bp.benefitId}_${bp.positionId}`
            return (
              <TableRow
                key={key}
                className="hover:bg-muted/40 transition-colors border-b border-border text-sm"
              >
                <TableCell className="font-semibold text-foreground">
                  <div>
                    <p>{bp.departmentName || bp.departmentId}</p>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      ID: {bp.departmentId}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  <div>
                    <p>{bp.positionTitle || bp.positionId}</p>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">
                      ID: {bp.positionId}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span>{bp.benefitName || bp.benefitId}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-foreground">
                  {formatCurrency(bp.limitAmount)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-muted"
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
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>

                    <DeletePlanDialog plan={bp}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DeletePlanDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>

        {plans.length === 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                Tidak ada data aturan plafon benefit yang sesuai dengan filter.
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Aturan Plafon Benefit</DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-xs">
            <span>Apakah Anda yakin ingin menghapus matriks plafon benefit berikut?</span>
            <div className="p-3 bg-muted rounded-lg font-medium text-foreground space-y-1">
              <p>
                <span className="text-muted-foreground">Departemen:</span>{' '}
                {plan.departmentName || plan.departmentId}
              </p>
              <p>
                <span className="text-muted-foreground">Jabatan:</span>{' '}
                {plan.positionTitle || plan.positionId}
              </p>
              <p>
                <span className="text-muted-foreground">Benefit:</span>{' '}
                {plan.benefitName || plan.benefitId}
              </p>
              <p>
                <span className="text-muted-foreground">Plafon:</span>{' '}
                {formatCurrency(plan.limitAmount)}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.AppForm>
              <Button type="submit" variant="destructive">
                Hapus
              </Button>
            </form.AppForm>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
