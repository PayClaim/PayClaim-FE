import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { createEmployeeForm } from '#/features/employees/forms/forms'
import { useGetAllEmployeesQuery } from '#/features/employees/queries/queries'
import { buildEmployeeGroups } from '#/features/employees/utils/employee-options'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/employees/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const form = createEmployeeForm()

  const { data: positions = [] } = useGetAllPositionsQuery()
  const positionOptions = positions.map((p) => ({
    label: p.title,
    value: p.id,
  }))

  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const departmentOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  const { data: employees = [] } = useGetAllEmployeesQuery()
  const managerGroups = buildEmployeeGroups(employees, {
    filter: (employee) =>
      employee.positionTitle.toLowerCase().includes('manager'),
    label: (employee) => `${employee.fullName} (${employee.number})`,
  })

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <Link to="/admin/employees">
        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee List</span>
        </Button>
      </Link>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Add New Employee
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftarkan akun karyawan, posisi, departemen, dan direct manager penilai klaim.
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
            <div className="sm:col-span-2">
              <form.AppField name="fullName">
                {(field) => (
                  <field.TextField
                    label="Nama Lengkap"
                    placeholder="Contoh: Budi Santoso"
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email Perusahaan"
                  placeholder="budi.santoso@mii.co.id"
                />
              )}
            </form.AppField>

            <form.AppField name="hireDate">
              {(field) => <field.DatePicker label="Tanggal Bergabung" />}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.FormSelect
                  values={positionOptions}
                  placeholder="Pilih Posisi / Jabatan"
                  label="Jabatan / Posisi"
                />
              )}
            </form.AppField>

            <form.AppField name="departmentId">
              {(field) => (
                <field.FormSelect
                  values={departmentOptions}
                  label="Departemen"
                  placeholder="Pilih Departemen"
                />
              )}
            </form.AppField>

            <form.Subscribe selector={(state) => state.values.positionId}>
              {(positionId) => {
                const selectedPos = positions.find((p) => p.id === positionId)
                const isManager =
                  positionId?.toUpperCase() === 'MGR' ||
                  Boolean(selectedPos?.title.toLowerCase().includes('manager'))

                if (isManager) return null

                return (
                  <div className="sm:col-span-2">
                    <form.AppField name="managerId">
                      {(field) => (
                        <field.FormSelect
                          nullable
                          groups={managerGroups}
                          label="Direct Manager (Penilai Klaim Level 1)"
                          placeholder="Pilih Direct Manager"
                        />
                      )}
                    </form.AppField>
                  </div>
                )
              }}
            </form.Subscribe>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link to="/admin/employees">
              <Button variant="outline" type="button" size="sm">
                Cancel
              </Button>
            </Link>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Save Employee"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
