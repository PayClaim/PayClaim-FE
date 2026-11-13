import { createDepartmentForm } from '#/features/departments/forms/forms'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/departments/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const form = createDepartmentForm()

  const departmentOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  return (
    <main className="max-w-xl mx-auto space-y-6">
      <Link to="/admin/departments">
        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Departments</span>
        </Button>
      </Link>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Add Department
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftarkan unit departemen baru dan tentukan induk organisasinya jika ada.
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
          <div className="space-y-4">
            <form.AppField name="id">
              {(field) => (
                <field.TextField
                  label="Kode Departemen"
                  placeholder="Contoh: ENG, FIN, HRD, MKT"
                />
              )}
            </form.AppField>

            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Nama Departemen"
                  placeholder="Contoh: Engineering, Finance & Accounting"
                />
              )}
            </form.AppField>

            <form.AppField name="parentDeptId">
              {(field) => (
                <field.FormSelect
                  nullable
                  values={departmentOptions}
                  label="Induk Departemen (Opsional)"
                  placeholder="Pilih Induk Departemen (jika sub-divisi)"
                />
              )}
            </form.AppField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link to="/admin/departments">
              <Button variant="outline" type="button" size="sm">
                Cancel
              </Button>
            </Link>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Save Department"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
