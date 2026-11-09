import { createFileRoute } from '@tanstack/react-router'
import { editBenefitPlanForm } from '#/features/benefit-plans/forms/forms'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import { useGetAllBenefitsQuery } from '#/features/benefits/queries/queries'
import type { UpsertBenefitPlanRequest } from '#/types/benefitPlans.type'

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
    { label: 'Semua Departemen', value: 'ALL' },
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
    <main className="bg-card max-w-2xl rounded-2xl p-6 sm:p-8 mx-auto border border-border shadow-xs">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black tracking-tight">Edit Benefit Plan</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Perbarui aturan atau batas plafon untuk kombinasi Departemen, Jabatan, dan Benefit ini.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.AppField name="departmentId">
            {(field) => (
              <field.FormSelect
                values={departmentOptions}
                label="Department"
                placeholder="Pilih Departemen"
              />
            )}
          </form.AppField>

          <form.AppField name="positionId">
            {(field) => (
              <field.FormSelect
                values={positionOptions}
                label="Position"
                placeholder="Pilih Jabatan"
              />
            )}
          </form.AppField>

          <div className="sm:col-span-2">
            <form.AppField name="benefitId">
              {(field) => (
                <field.FormSelect
                  values={benefitOptions}
                  label="Benefit"
                  placeholder="Pilih Jenis Benefit"
                />
              )}
            </form.AppField>
          </div>

          <div className="sm:col-span-2">
            <form.AppField name="limitAmount">
              {(field) => (
                <field.NumberField
                  label="Limit Amount (IDR)"
                  placeholder="Contoh: 2000000"
                />
              )}
            </form.AppField>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <form.AppForm>
            <form.FormButton label="Update Plan" />
          </form.AppForm>
        </div>
      </form>
    </main>
  )
}
