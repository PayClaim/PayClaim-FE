import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { editBenefitPlanForm } from '#/features/benefit-plans/forms/forms'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import { useGetAllBenefitsQuery } from '#/features/benefits/queries/queries'
import type { UpsertBenefitPlanRequest } from '#/types/benefitPlans.type'
import { ArrowLeft, Layers } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/benefit-plans/edit')({
  component: EditBenefitPlanPage,
  validateSearch: (s): UpsertBenefitPlanRequest => {
    return {
      departmentId: String(s.departmentId ?? ''),
      positionId: String(s.positionId ?? ''),
      benefitId: String(s.benefitId ?? ''),
      limitAmount: Number(s.limitAmount ?? 0),
    }
  },
})

function EditBenefitPlanPage() {
  const router = useRouter()
  const initialValue = Route.useSearch()
  const form = editBenefitPlanForm(
    {
      departmentId: initialValue.departmentId,
      benefitId: initialValue.benefitId,
      positionId: initialValue.positionId,
    },
    initialValue,
  )

  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const departmentOptions = [
    { label: 'Semua Departemen (ALL)', value: 'ALL' },
    ...departments.map((d) => ({
      label: d.name,
      value: d.id,
    })),
  ]

  const { data: positions = [] } = useGetAllPositionsQuery()
  const positionOptions = positions.map((p) => ({
    label: p.title,
    value: p.id,
  }))

  const { data: benefits = [] } = useGetAllBenefitsQuery()
  const benefitOptions = benefits.map((b) => ({
    label: b.name,
    value: b.id,
  }))

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <Button
        onClick={() => router.history.back()}
        variant="outline"
        size="sm"
        className="gap-2 text-xs font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Benefit Plans</span>
      </Button>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Edit Aturan Plafon Benefit
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbarui batas nominal klaim untuk kombinasi departemen dan
              jabatan ini.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.AppField name="departmentId">
              {(field) => (
                <field.FormSelect
                  values={departmentOptions}
                  label="Departemen"
                  placeholder="Pilih Departemen"
                />
              )}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.FormSelect
                  values={positionOptions}
                  label="Jabatan / Posisi"
                  placeholder="Pilih Posisi"
                />
              )}
            </form.AppField>

            <div className="sm:col-span-2">
              <form.AppField name="benefitId">
                {(field) => (
                  <field.FormSelect
                    values={benefitOptions}
                    label="Jenis Benefit"
                    placeholder="Pilih Jenis Benefit"
                  />
                )}
              </form.AppField>
            </div>

            <div className="sm:col-span-2">
              <form.AppField name="limitAmount">
                {(field) => (
                  <field.CurrencyField
                    label="Nominal Plafon (IDR)"
                    placeholder="0"
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link to="/admin/benefit-plans">
              <Button variant="outline" type="button" size="sm">
                Cancel
              </Button>
            </Link>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Perbarui Plafon"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
