import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import { editBenefitForm } from '#/features/benefits/forms/forms'
import { useGetBenefitQuery } from '#/features/benefits/queries/queries'
import type { BenefitResponse } from '#/types/benefits.type'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Gift } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/benefits/$benefitId/edit')({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { benefitId } = Route.useParams()
  const { data: benefit, isLoading, isError } = useGetBenefitQuery(benefitId)
  const { data: categories = [] } = useGetAllCategoriesQuery()

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading benefit data...</p>
      </main>
    )
  }

  if (isError || !benefit) {
    return (
      <main className="max-w-2xl mx-auto space-y-4">
        <Link to="/admin/benefits">
          <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Master Benefits</span>
          </Button>
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Data benefit tidak ditemukan atau telah dihapus.
        </div>
      </main>
    )
  }

  return (
    <EditBenefitFormContent
      benefitId={benefitId}
      benefit={benefit}
      categories={categories}
    />
  )
}

function EditBenefitFormContent({
  benefitId,
  benefit,
  categories,
}: {
  benefitId: string
  benefit: BenefitResponse
  categories: { id: number; name: string }[]
}) {
  const form = editBenefitForm(benefitId, {
    name: benefit.name,
    description: benefit.description,
    periodType: benefit.periodType,
    categoryId: benefit.categoryId,
  })

  const periodTypeOption = [
    { label: 'Monthly (Bulanan)', value: 'Monthly' },
    { label: 'Yearly (Tahunan)', value: 'Yearly' },
    { label: 'One Time (Sekali Pakai)', value: 'OneTime' },
  ]

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }))

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <Link to="/admin/benefits">
        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Master Benefits</span>
        </Button>
      </Link>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Edit Master Benefit
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID Benefit: <span className="font-mono text-heading">{benefitId}</span>
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
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nama Benefit"
                    placeholder="Contoh: Kacamata & Lensa, Tunjangan Kesehatan Gigi"
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="periodType">
              {(field) => (
                <field.FormSelect
                  values={periodTypeOption}
                  label="Periode Klaim"
                  placeholder="Pilih Periode"
                />
              )}
            </form.AppField>

            <form.AppField name="categoryId">
              {(field) => (
                <field.FormSelectNumber
                  values={categoryOptions}
                  label="Kategori Benefit"
                  placeholder="Pilih Kategori"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.TextArea
                label="Deskripsi / Ketentuan Benefit"
                placeholder="Jelaskan ruang lingkup, ketentuan syarat nota, atau rincian reimbursement..."
              />
            )}
          </form.AppField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link to="/admin/benefits">
              <Button variant="outline" type="button" size="sm">
                Cancel
              </Button>
            </Link>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Perbarui Benefit"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
