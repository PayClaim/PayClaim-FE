import { getCurrentUser } from '#/features/auth/queries/queries'
import {
  useApproveClaimMutation,
  useGetClaimsQuery,
  usePayClaimMutation,
  useRejectClaimMutation,
} from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { toDateTimeString } from '#/lib/utils'
import { getClaimBadgeClass } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Download,
  FileCheck,
  FileText,
  XCircle,
} from 'lucide-react'

export const Route = createFileRoute('/_app/claims/$claimId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isFetching, isError, error } = useGetClaimsQuery(claimId)
  const { data: user } = useQuery(getCurrentUser())

  const roles = user?.roles || []
  const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
  const isFinance = roles.some((r) =>
    ['finance', 'finance manager'].includes(r.toLowerCase()),
  )
  const isManager = roles.some((r) => r.toLowerCase() === 'manager')

  // Validasi agar pengguna tidak bisa menyetujui klaim miliknya sendiri
  const isOwnClaim = Boolean(
    user?.employeeId && claim?.employeeId && user.employeeId === claim.employeeId,
  )

  const approveMutation = useApproveClaimMutation(claimId)
  const rejectMutation = useRejectClaimMutation(claimId)
  const payMutation = usePayClaimMutation(claimId)

  const [notes, setNotes] = useState('')
  const [actionType, setActionType] = useState<
    'Approved' | 'Rejected' | 'NeedsRevision' | 'Pay' | null
  >(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAction = async () => {
    if (!actionType) return

    try {
      if (actionType === 'Pay') {
        await payMutation.mutateAsync({ notes: notes || undefined })
        toast.success('Claim has been marked as Paid successfully.')
      } else if (actionType === 'Approved') {
        await approveMutation.mutateAsync({
          decision: 'Approved',
          notes: notes || undefined,
        })
        toast.success('Claim has been approved successfully.')
      } else if (actionType === 'NeedsRevision') {
        await rejectMutation.mutateAsync({
          decision: 'NeedsRevision',
          notes: notes || undefined,
        })
        toast.info('Claim returned to employee for revision.')
      } else if (actionType === 'Rejected') {
        await rejectMutation.mutateAsync({
          decision: 'Rejected',
          notes: notes || undefined,
        })
        toast.success('Claim has been rejected.')
      }
      setDialogOpen(false)
      setNotes('')
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast.error(e.message || 'Action failed to process.')
    }
  }

  if (isFetching) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <div className="bg-card p-8 rounded-2xl border border-border text-center text-muted-foreground">
          Loading claim details...
        </div>
      </main>
    )
  }

  if (isError || !claim) {
    return (
      <main className="max-w-4xl mx-auto space-y-4">
        <Link to="/claims">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Claims
          </Button>
        </Link>
        <div className="bg-card p-8 rounded-2xl border border-destructive text-destructive">
          Error: {error ? error.message : 'Claim not found.'}
        </div>
      </main>
    )
  }

  /**
   * Aturan Visibilitas Tombol Action (Berdasarkan tahap 2-Step Approval Backend):
   * 1. Status 'Submitted' (Level 1):
   *    - Menunggu persetujuan Manager langsung atau Admin.
   *    - Tombol Approve, Reject, dan Request Revision hanya muncul jika user adalah Manager atau Admin (dan bukan klaim sendiri).
   * 2. Status 'UnderReview' (Level 2):
   *    - Manager sudah approve, sekarang berada di tangan Finance.
   *    - Tombol Approve, Reject, dan Request Revision HANYA muncul untuk Finance, Finance Manager, atau Admin.
   *    - Manager biasa TIDAK BOLEH melihat tombol lagi.
   * 3. Status 'Approved' (Level 3 - Disbursement / Opsi A):
   *    - Sudah disetujui Finance, saldo benefit sudah terpotong.
   *    - Hanya Finance, Finance Manager, atau Admin yang dapat melihat tombol "Disburse & Mark as Paid".
   * 4. Status 'Paid', 'Rejected', 'NeedsRevision':
   *    - Tidak ada aksi approval yang bisa dilakukan lagi.
   */
  const canManagerApprove =
    claim.status === 'Submitted' && (isManager || isAdmin) && !isOwnClaim

  const canFinanceApprove =
    claim.status === 'UnderReview' && (isFinance || isAdmin) && !isOwnClaim

  const canDisburseAndPay =
    claim.status === 'Approved' && (isFinance || isAdmin)

  const showApprovalActions = canManagerApprove || canFinanceApprove

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : ''
  const receiptUrl =
    claim.filePath?.startsWith('http')
      ? claim.filePath
      : `${backendBaseUrl}${claim.filePath?.startsWith('/') ? '' : '/'}${claim.filePath}`

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/claims">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-heading">
                Claim #{claim.id.slice(0, 8)}
              </h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getClaimBadgeClass(
                  claim.status,
                )}`}
              >
                {claim.status === 'UnderReview'
                  ? 'Under Review (Finance)'
                  : claim.status === 'Approved'
                    ? 'Approved (Pending Payment)'
                    : claim.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted on{' '}
              {claim.submittedAt ? toDateTimeString(new Date(claim.submittedAt)) : '-'}
            </p>
          </div>
        </div>

        {/* Action Buttons Container */}
        <div className="flex flex-wrap items-center gap-2">
          {showApprovalActions && (
            <>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/30"
                onClick={() => {
                  setActionType('NeedsRevision')
                  setNotes('')
                  setDialogOpen(true)
                }}
              >
                Request Revision
              </Button>
              <Button
                variant="destructive"
                className="gap-1.5"
                onClick={() => {
                  setActionType('Rejected')
                  setNotes('')
                  setDialogOpen(true)
                }}
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => {
                  setActionType('Approved')
                  setNotes('')
                  setDialogOpen(true)
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                {claim.status === 'Submitted' ? 'Approve (Manager)' : 'Approve (Finance)'}
              </Button>
            </>
          )}

          {canDisburseAndPay && (
            <Button
              className="bg-green-700 hover:bg-green-800 text-white gap-1.5 shadow-xs"
              onClick={() => {
                setActionType('Pay')
                setNotes('')
                setDialogOpen(true)
              }}
            >
              <DollarSign className="h-4 w-4" /> Disburse & Mark Paid
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Claim Information Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border space-y-6 shadow-xs">
            <h2 className="text-lg font-bold border-b border-border pb-3">
              Claim Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase font-medium">
                  Claim Type
                </span>
                <span className="font-semibold text-heading">
                  {claim.claimType === 'OperationalReimbursement'
                    ? 'Operational Reimbursement'
                    : claim.claimType === 'BusinessTripReimbursement'
                      ? 'Business Trip Reimbursement'
                      : 'Benefit Reimbursement'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs uppercase font-medium">
                  Amount Requested
                </span>
                <span className="text-lg font-bold text-primary">
                  {idNumberFormatter.format(claim.amount)}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs uppercase font-medium">
                  Transaction Date
                </span>
                <span className="font-medium text-heading">
                  {claim.transactionDate ? String(claim.transactionDate) : '-'}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-xs uppercase font-medium">
                  Benefit / Plan
                </span>
                <span className="font-medium text-heading">
                  {claim.benefitName || '-'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-muted-foreground block text-xs uppercase font-medium">
                  Description
                </span>
                <p className="mt-1 p-3 rounded-xl bg-muted/30 border border-border whitespace-pre-wrap">
                  {claim.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Proof Attachment */}
          <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">Receipt / Proof Document</h2>
              {claim.filePath && (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                >
                  <Download className="h-3.5 w-3.5" /> Open / Download File
                </a>
              )}
            </div>

            {claim.filePath ? (
              <div className="mt-2">
                {claim.filePath.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                  <div className="rounded-xl border border-border overflow-hidden max-h-96 flex items-center justify-center bg-muted/20">
                    <img
                      src={receiptUrl}
                      alt="Receipt Attachment"
                      className="max-h-96 object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-border bg-muted/10 flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-sm text-heading">
                        Document Attachment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.filePath.split('/').pop()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No receipt document attached.</p>
            )}
          </div>
        </div>

        {/* Right Side: Submitter Details & Approval Log */}
        <div className="space-y-6">
          {/* Submitter Card */}
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Submitter Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Employee</span>
                <p className="font-semibold text-heading">{claim.employeeName}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {claim.employeeNumber}
                </p>
              </div>

              {claim.departmentName && (
                <div>
                  <span className="text-xs text-muted-foreground block">Department</span>
                  <p className="font-medium text-heading">{claim.departmentName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Approval History Timeline */}
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4 shadow-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Approval History
            </h2>

            {claim.approvalHistory && claim.approvalHistory.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {claim.approvalHistory.map((h) => (
                  <div key={h.id} className="relative pl-7 text-xs space-y-1">
                    <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-heading">
                        {h.approverName || 'Approver'}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${getClaimBadgeClass(
                          h.decision,
                        )}`}
                      >
                        {h.decision}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      Level {h.approvalLevel} •{' '}
                      {h.decidedAt ? toDateTimeString(new Date(h.decidedAt)) : '-'}
                    </p>
                    {h.notes && (
                      <p className="p-2 rounded bg-muted/40 border border-border text-heading italic">
                        "{h.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground py-4 text-center">
                <FileCheck className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
                No approval actions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Dialog (Approve, Reject, Revision, Pay) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'Approved'
                ? `Approve Claim (${claim.status === 'Submitted' ? 'Level 1: Manager' : 'Level 2: Finance'})`
                : actionType === 'Rejected'
                  ? 'Reject Claim'
                  : actionType === 'NeedsRevision'
                    ? 'Request Revision'
                    : 'Disburse & Mark as Paid'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'Approved'
                ? claim.status === 'Submitted'
                  ? 'Sebagai Manager, Anda akan menyetujui klaim ini untuk diteruskan ke tim Finance (Under Review).'
                  : 'Sebagai Finance, menyetujui klaim ini akan langsung memotong saldo kuota benefit karyawan dan mengubah status menjadi Approved (siap dicairkan).'
                : actionType === 'Rejected'
                  ? 'Klaim ini akan ditolak secara permanen. Berikan alasan penolakan.'
                  : actionType === 'NeedsRevision'
                    ? 'Kembalikan klaim ke karyawan agar dapat diperbaiki (misal: nota tidak jelas/salah nominal).'
                    : 'Konfirmasi bahwa dana reimbursement telah ditransfer/dicairkan ke karyawan dan dicatat ke payroll.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Notes / Feedback {actionType === 'NeedsRevision' ? '(Required)' : '(Optional)'}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                actionType === 'NeedsRevision'
                  ? 'Jelaskan apa yang perlu diperbaiki oleh karyawan...'
                  : 'Tambahkan catatan jika diperlukan...'
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className={
                actionType === 'Rejected'
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : actionType === 'NeedsRevision'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-primary hover:bg-primary/90 text-white'
              }
              disabled={
                (actionType === 'NeedsRevision' && !notes.trim()) ||
                approveMutation.isPending ||
                rejectMutation.isPending ||
                payMutation.isPending
              }
              onClick={handleAction}
            >
              Confirm{' '}
              {actionType === 'Approved'
                ? 'Approval'
                : actionType === 'Rejected'
                  ? 'Rejection'
                  : actionType === 'NeedsRevision'
                    ? 'Revision'
                    : 'Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
