import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { editClaimForm } from '#/features/claims/forms/forms'
import { useGetClaimsQuery } from '#/features/claims/queries/queries'
import type { ClaimResponseWithHistory } from '#/types/claims.type'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ErrorComponent, LoadingComponent } from '#/components/ErrorAndLoading'
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-react'
import { downloadFile } from '#/lib/download'

export const Route = createFileRoute('/_app/claims/$claimId_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isError, error, isFetching } = useGetClaimsQuery(claimId)

  if (isError) return <ErrorComponent pageTitle="Revise Claim" error={error} />
  if (isFetching || !claim) return <LoadingComponent pageTitle="Revise Claim" />

  return <EditClaimFormContent claimId={claimId} claim={claim} />
}

function EditClaimFormContent({
  claimId,
  claim,
}: {
  claimId: string
  claim: ClaimResponseWithHistory
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const initialValue = {
    claimType: claim.claimType,
    transactionDate: claim.transactionDate?.slice(0, 10) || '',
    description: claim.description || '',
    amount: claim.amount || 0,
    tripProposalId: claim.tripProposalId ?? null,
    employeeBenefitId: claim.employeeBenefitId ?? null,
  }

  const form = editClaimForm(claimId, initialValue)

  // Ambil history catatan revisi terakhir dari peninjau
  const lastRevisionHistory = [...(claim.approvalHistory || [])]
    .reverse()
    .find(
      (h) =>
        String(h.decision).toLowerCase().includes('revision') ||
        Boolean(h.notes?.trim()),
    )

  const existingFileName = claim.filePath
    ? claim.filePath.split('/').pop()?.split('?')[0] || 'Receipt_Attachment'
    : null

  const handleReview = async () => {
    await form.validateAllFields('submit')
    if (form.state.isValid) setDialogOpen(true)
  }

  const handleConfirm = async () => {
    await form.handleSubmit()
    setDialogOpen(false)
  }

  return (
    <main className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header navigasi */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/claims/$claimId"
            params={{ claimId }}
            className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-heading">
              Revisi Klaim #{claim.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbaiki informasi atau berkas klaim sesuai catatan dari reviewer.
            </p>
          </div>
        </div>
      </div>

      {/* Banner Catatan Reviewer (Alasan Revisi) */}
      {lastRevisionHistory?.notes && (
        <section className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/40 p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-sm font-bold">Catatan Permintaan Revisi</h2>
            <span className="text-xs text-amber-700/80 dark:text-amber-400 font-normal ml-auto">
              Oleh: {lastRevisionHistory.approverName || 'Reviewer'}
            </span>
          </div>

          <div className="pl-7">
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed font-medium bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/60">
              "{lastRevisionHistory.notes}"
            </p>
          </div>
        </section>
      )}

      {/* Form Container */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleReview()
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.AppField name="transactionDate">
              {(field) => <field.DatePicker label="Tanggal Transaksi / Kwitansi" />}
            </form.AppField>

            <form.AppField name="amount">
              {(field) => (
                <field.CurrencyField label="Nominal Klaim" placeholder="0" />
              )}
            </form.AppField>
          </div>

          {/* Bukti Lampiran Lama (jika ada) */}
          {claim.filePath && (
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Berkas Kwitansi Terlampir Saat Ini
                </span>
                <button
                  type="button"
                  onClick={() => void downloadFile(claim.filePath, existingFileName)}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Berkas Lama
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Nama file: <span className="font-mono text-foreground font-medium">{existingFileName}</span>. Jika Anda tidak mengunggah file baru di bawah, berkas lama ini akan tetap digunakan.
              </p>
            </div>
          )}

          {/* Upload Bukti Baru */}
          <form.AppField name="receiptFile">
            {(field) => (
              <field.FileInput label="Unggah Bukti Baru (Opsional jika tidak diganti)" />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextArea
                label="Keterangan / Penjelasan Revisi"
                placeholder="Tuliskan keterangan perbaikan yang telah Anda lakukan..."
                rows={4}
              />
            )}
          </form.AppField>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link to="/claims/$claimId" params={{ claimId }}>
              <Button type="button" variant="outline" className="cursor-pointer">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
            >
              Ajukan Ulang Revisi
            </Button>
          </div>

          {/* Dialog Konfirmasi Submit */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Kirim Ulang Revisi Klaim?</DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  Klaim Anda akan diperbarui dan dikirim kembali kepada peninjau untuk dilakukan verifikasi ulang.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="cursor-pointer">
                    Batal
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  {form.state.isSubmitting ? 'Mengirim...' : 'Ya, Kirim Ulang'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </main>
  )
}
