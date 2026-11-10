import { Button } from '#/components/ui/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Pencil, Plus, Search, SearchX, Tags, Trash2 } from 'lucide-react'
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
import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import type { BenefitCategoryResponse } from '#/types/benefitCategories'
import { deleteCategoryForm } from '#/features/benefit-categories/forms/forms'

export const Route = createFileRoute('/_app/admin/benefit-categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: categories = [], isError, isLoading } = useGetAllCategoriesQuery()
  const [searchFilter, setSearchFilter] = useState<string>('')

  const displayData = categories.filter((c) => {
    return !searchFilter || c.name.toLowerCase().includes(searchFilter.toLowerCase())
  })

  if (isError) {
    return (
      <main className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Terjadi kesalahan saat memuat daftar kategori benefit. Silakan coba kembali nanti.
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Memuat data kategori benefit...</p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Tags className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-heading tracking-tight">
                Benefits Categories
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {categories.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Kelola kategori klasifikasi tunjangan dan klaim karyawan.
            </p>
          </div>
        </div>

        <Link to="/admin/benefit-categories/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs gap-1.5 h-10 px-4 rounded-lg">
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Category</span>
          </Button>
        </Link>
      </div>

      {/* Table Card Container */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex flex-wrap items-center justify-between gap-4 bg-muted/15">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search category name..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-heading placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Showing {displayData.length} of {categories.length} categories
          </div>
        </div>

        {/* Table Content */}
        {displayData.length > 0 ? (
          <CategoryTable categories={displayData} />
        ) : (
          <div className="py-16 text-center space-y-3">
            <SearchX className="w-10 h-10 text-muted-foreground/50 mx-auto" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-heading">Tidak ada kategori ditemukan</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchFilter
                  ? `Tidak ada kategori yang cocok dengan pencarian "${searchFilter}". Coba ubah kata kunci.`
                  : 'Belum ada kategori benefit yang terdaftar di sistem.'}
              </p>
            </div>
            {searchFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchFilter('')}
                className="text-xs font-semibold h-8"
              >
                Reset Pencarian
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function CategoryTable({
  categories,
}: {
  categories: BenefitCategoryResponse[]
}) {
  const navigate = useNavigate()
  const thClass = 'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader className="bg-muted/30 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${thClass} w-24`}>ID</TableHead>
            <TableHead className={thClass}>CATEGORY NAME</TableHead>
            <TableHead className={`${thClass} text-right w-32`}>ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow
              key={c.id}
              className="hover:bg-muted/30 transition-colors border-b border-border/60"
            >
              <TableCell className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                #{c.id}
              </TableCell>
              <TableCell className="px-5 py-3.5 font-medium text-heading">
                {c.name}
              </TableCell>
              <TableCell className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 cursor-pointer"
                    title="Edit Category"
                    onClick={() => {
                      navigate({
                        to: '/admin/benefit-categories/$categoryId/edit',
                        params: { categoryId: c.id.toString() },
                        search: { name: c.name },
                      })
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>

                  <DeleteDialog id={c.id} name={c.name}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </DeleteDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DeleteDialog({
  children,
  id,
  name,
}: {
  children: ReactNode
  id: number
  name: string
}) {
  const form = deleteCategoryForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Kategori Benefit</DialogTitle>
          <DialogDescription className="text-sm pt-1">
            Apakah Anda yakin ingin menghapus kategori <strong>"{name}"</strong>? Tindakan ini tidak dapat dibatalkan jika kategori telah terkait dengan jenis benefit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Batal</Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Button variant="destructive" size="sm" type="submit">
              Hapus Kategori
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
