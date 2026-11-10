import { editCategoryForm } from '#/features/benefit-categories/forms/forms'
import { useGetCategoryQuery } from '#/features/benefit-categories/queries/queries'
import type { BenefitCategoryResponse } from '#/types/benefitCategories'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Tags } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute(
  '/_app/admin/benefit-categories/$categoryId/edit',
)({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { categoryId } = Route.useParams()
  const { data: category, isLoading, isError } = useGetCategoryQuery(Number(categoryId))

  if (isLoading) {
    return (
      <main className="max-w-xl mx-auto py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat data kategori...</p>
      </main>
    )
  }

  if (isError || !category) {
    return (
      <main className="max-w-xl mx-auto space-y-4">
        <Link to="/admin/benefit-categories">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kategori Benefit</span>
          </Button>
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Kategori benefit tidak ditemukan atau telah dihapus.
        </div>
      </main>
    )
  }

  return (
    <EditCategoryFormContent
      categoryId={Number(categoryId)}
      category={category}
    />
  )
}

function EditCategoryFormContent({
  categoryId,
  category,
}: {
  categoryId: number
  category: BenefitCategoryResponse
}) {
  const form = editCategoryForm(categoryId, { name: category.name })

  return (
    <main className="max-w-xl mx-auto space-y-6">
      <Link to="/admin/benefit-categories">
        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Kategori Benefit</span>
        </Button>
      </Link>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Tags className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Edit Kategori Benefit
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID Kategori: #{categoryId}
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
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Nama Kategori"
                placeholder="Contoh: Kesehatan, Transportasi, Kebugaran"
              />
            )}
          </form.AppField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link to="/admin/benefit-categories">
              <Button variant="outline" type="button" size="sm">
                Batal
              </Button>
            </Link>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Perbarui Kategori"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
