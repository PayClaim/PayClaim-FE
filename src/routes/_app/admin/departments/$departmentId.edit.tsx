import { editDepartmentForm } from '#/features/departments/forms/forms'
import {
  useGetAllDepartmentsQuery,
  useGetDepartmentQuery,
} from '#/features/departments/queries/queries'
import type { DepartmentResponse } from '#/types/department.type'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute(
  '/_app/admin/departments/$departmentId/edit',
)({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { departmentId } = Route.useParams()
  const { data: department, isLoading, isError } = useGetDepartmentQuery(departmentId)
  const { data: departments = [] } = useGetAllDepartmentsQuery()

  if (isLoading) {
    return (
      <main className="max-w-xl mx-auto py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading department data...</p>
      </main>
    )
  }

  if (isError || !department) {
    return (
      <main className="max-w-xl mx-auto space-y-4">
        <Link to="/admin/departments">
          <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Departments</span>
          </Button>
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Departemen tidak ditemukan atau telah dihapus.
        </div>
      </main>
    )
  }

  return (
    <EditDepartmentFormContent
      departmentId={departmentId}
      department={department}
      departments={departments}
    />
  )
}

function EditDepartmentFormContent({
  departmentId,
  department,
  departments,
}: {
  departmentId: string
  department: DepartmentResponse
  departments: DepartmentResponse[]
}) {
  const departmentOptions = departments
    .filter((d) => d.id !== departmentId)
    .map((d) => ({
      label: d.name,
      value: d.id,
    }))

  const form = editDepartmentForm(departmentId, {
    name: department.name,
    parentDeptId: department.parentDeptId ?? null,
  })

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
              Edit Departemen
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kode Departemen: <span className="font-mono font-bold text-heading">{departmentId}</span>
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
                  placeholder="Pilih Induk Departemen (jika sub-divisi)"
                  values={departmentOptions}
                  label="Induk Departemen (Opsional)"
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
                label="Perbarui Departemen"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
