import { createCategoryForm } from '#/features/benefit-categories/forms/forms'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Tags } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/benefit-categories/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const form = createCategoryForm()

  return (
    <main className="max-w-xl mx-auto space-y-6">
      <Link to="/admin/benefit-categories">
        <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Benefit Categories</span>
        </Button>
      </Link>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Tags className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Add Benefit Category
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter a new category name to group benefit types.
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
                label="Category Name"
                placeholder="e.g. Health, Transportation, Wellness"
              />
            )}
          </form.AppField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Link to="/admin/benefit-categories">
              <Button variant="outline" type="button" size="sm">
                Cancel
              </Button>
            </Link>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Save Category"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
