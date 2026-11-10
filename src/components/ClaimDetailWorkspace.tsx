import { getCurrentUser } from '#/features/auth/queries/queries'
import {
  useApproveClaimMutation,
  useGetClaimsQuery,
  usePayClaimMutation,
  useRejectClaimMutation,
} from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { toDateTimeString } from '#/lib/utils'
import { getFriendlyErrorMessage } from '#/lib/error'
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
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileText,
  Flag,
  XCircle,
} from 'lucide-react'

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function parseUtcDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null
  const normalized =
    dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('T')
      ? dateStr.endsWith('Z') || dateStr.includes('+')
        ? dateStr
        : `${dateStr}Z`
      : dateStr
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

function formatDateBox(dateStr?: string | null) {
  const d = parseUtcDate(dateStr)
  if (!d) {
    return {
      day: '--',
      monthYear: 'Pending',
      time: '--:--',
      longDate: '-',
    }
  }
  const day = d.getDate()
  const monthShort = d.toLocaleDateString('en-US', { month: 'short' })
  const monthLong = d.toLocaleDateString('en-US', { month: 'long' })
  const year = d.getFullYear()
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return {
    day: String(day),
    monthYear: `${monthShort}, ${year}`,
    time,
    longDate: `${day} ${monthLong}, ${year}`,
  }
}

interface ClaimDetailWorkspaceProps {
  claimId: string
  backTo?: string
  backLabel?: string
}

export function ClaimDetailWorkspace({
  claimId,
  backTo = '/claims',
  backLabel = 'Back to Claims',
}: ClaimDetailWorkspaceProps) {
  const { data: claim, isFetching, isError, error } = useGetClaimsQuery(claimId)
  const { data: user } = useQuery(getCurrentUser())

  const roles = user?.roles || []
  const isAdmin = roles.some((r) => r.toLowerCase() === 'admin')
  const isFinance = roles.some((r) =>
    ['finance', 'finance manager'].includes(r.toLowerCase()),
  )
  const isManager = roles.some((r) => r.toLowerCase() === 'manager')

  const isOwnClaim = Boolean(
    user?.employeeId && claim?.employeeId && user.employeeId === claim.employeeId,
  )

  const approveMutation = useApproveClaimMutation(claimId)
  const rejectMutation = useRejectClaimMutation(claimId)
  const payMutation = usePayClaimMutation(claimId)

  const [notes, setNotes] = useState('')
  const [expandDescription, setExpandDescription] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
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
      toast.error(getFriendlyErrorMessage(err, 'Gagal memproses aksi pada klaim ini.'))
    }
  }

  if (isFetching) {
    return (
      <main className="w-full max-w-[1600px] mx-auto">
        <div className="bg-card p-10 rounded-xl border border-border text-center text-muted-foreground">
          Loading claim details and approval workflow...
        </div>
      </main>
    )
  }

  if (isError || !claim) {
    return (
      <main className="w-full max-w-[1600px] mx-auto space-y-4">
        <Link to={backTo}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
          </Button>
        </Link>
        <div className="bg-card p-8 rounded-xl border border-destructive text-destructive">
          Failed to load claim details: {error ? error.message : 'Claim record was not found.'}
        </div>
      </main>
    )
  }

  const canManagerApprove =
    claim.status === 'Submitted' && (isManager || isAdmin) && !isOwnClaim

  const canFinanceApprove =
    claim.status === 'UnderReview' && (isFinance || isAdmin) && !isOwnClaim

  const canDisburseAndPay =
    claim.status === 'Approved' && (isFinance || isAdmin)

  const showApprovalActions = canManagerApprove || canFinanceApprove

  const canResubmitClaim =
    claim.status === 'NeedsRevision' && (isOwnClaim || isAdmin)

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : ''
  const receiptUrl = claim.filePath?.startsWith('http')
    ? claim.filePath
    : `${backendBaseUrl}${claim.filePath?.startsWith('/') ? '' : '/'}${claim.filePath}`

  const isImageReceipt = Boolean(
    claim.filePath && claim.filePath.match(/\.(jpeg|jpg|png|webp|gif)$/i),
  )
  const isPdfReceipt = Boolean(
    claim.filePath && claim.filePath.match(/\.pdf$/i),
  )
  const receiptFileName = claim.filePath
    ? claim.filePath.split('/').pop() || 'Receipt_Attachment'
    : null

  const sortedApprovalHistory = [...(claim.approvalHistory || [])].sort(
    (a, b) => {
      const timeA = a.decidedAt ? new Date(a.decidedAt).getTime() : 0
      const timeB = b.decidedAt ? new Date(b.decidedAt).getTime() : 0
      return timeB - timeA
    },
  )

  const level1Approval = sortedApprovalHistory.find(
    (h) => h.approvalLevel === 1,
  )

  const managerDisplayName =
    level1Approval?.approverName || claim.managerName || 'Direct Manager'
  const level2Approval = sortedApprovalHistory.find(
    (h) => h.approvalLevel === 2,
  )

  const isDecisionRejected = (dec?: unknown) => {
    if (!dec) return false
    const s = String(dec).toLowerCase()
    return s === 'rejected' || s === '2'
  }

  const isDecisionApproved = (dec?: unknown) => {
    if (!dec) return false
    const s = String(dec).toLowerCase()
    return s === 'approved' || s === '1'
  }

  const isClaimRejected = String(claim.status).toLowerCase() === 'rejected'

  const isLevel2Rejected =
    isDecisionRejected(level2Approval?.decision) ||
    (isClaimRejected &&
      (Boolean(level2Approval) || isDecisionApproved(level1Approval?.decision)))

  const isLevel1Rejected =
    isDecisionRejected(level1Approval?.decision) ||
    (isClaimRejected && !isLevel2Rejected)

  const submittedDateInfo = formatDateBox(claim.submittedAt)
  const txDateInfo = formatDateBox(claim.transactionDate)

  const claimTypeLabel =
    claim.claimType === 'OperationalReimbursement'
      ? 'Operational Reimbursement'
      : claim.claimType === 'BusinessTripReimbursement'
        ? 'Business Trip Reimbursement'
        : 'Benefit Reimbursement'

  const statusDisplayLabel =
    claim.status === 'UnderReview'
      ? 'Under Review (Finance)'
      : claim.status === 'Approved'
        ? 'Approved (Pending Payment)'
        : claim.status === 'NeedsRevision'
          ? 'Needs Revision'
          : claim.status

  const descriptionText = claim.description || 'No additional description provided.'
  const isLongDescription = descriptionText.length > 140

  return (
    <main className="w-full max-w-[1600px] mx-auto space-y-4">
      {/* Warning banner jika status NeedsRevision */}
      {claim.status === 'NeedsRevision' && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle
            className="h-5 w-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400"
            aria-hidden="true"
          />
          <div className="text-sm">
            <p className="font-semibold">Revisi Diperlukan</p>
            <p className="text-xs mt-0.5">
              Klaim ini dikembalikan oleh reviewer untuk diperbaiki. Silakan periksa catatan pada kartu proses, lalu klik tombol <strong>Edit & Resubmit Claim</strong> untuk mengajukan ulang.
            </p>
          </div>
        </div>
      )}

      {/* Two-Pane Workspace Container (Wide Layout) */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
        {/* ================= LEFT PANE: CLAIM INFO & ATTACHMENT THUMBNAIL ================= */}
        <aside className="lg:col-span-4 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-start bg-card">
          {/* Top Summary Block */}
          <div className="p-6 border-b border-border space-y-4">
              <div className="flex items-center justify-between">
                <Link
                  to={backTo}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-heading hover:text-primary transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border bg-muted/40">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>{backLabel}</span>
                </Link>

                {claim.filePath && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5"
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Preview
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight text-heading">
                    CLAIM #{claim.id.slice(0, 8).toLowerCase()}
                  </h2>
                  <Flag
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                  Submitted on {submittedDateInfo.longDate}
                </p>

                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getClaimBadgeClass(
                      claim.status,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {statusDisplayLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Block: Claim Info */}
            <div className="p-6 border-b border-border space-y-4">
              <h3 className="text-base font-bold text-heading">Claim Info</h3>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    Claimant Name
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      {getInitials(claim.employeeName)}
                    </div>
                    <div>
                      <p className="font-semibold text-heading leading-tight">
                        {claim.employeeName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.employeeNumber}
                        {claim.departmentName ? ` • ${claim.departmentName}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    Claim Type
                  </span>
                  <p className="font-semibold text-heading">{claimTypeLabel}</p>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    Benefit / Trip Reference
                  </span>
                  <p className="font-semibold text-heading">
                    {claim.benefitName ||
                      claim.tripProposalDescription ||
                      'Operational Expense'}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">
                    Amount Requested
                  </span>
                  <p className="text-base font-extrabold text-primary">
                    {idNumberFormatter.format(claim.amount)}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    Date of Transaction
                  </span>
                  <div className="flex items-center gap-2 font-semibold text-heading">
                    <Calendar
                      className="h-4 w-4 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                    <span>{txDateInfo.longDate}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    Notes
                  </span>
                  <p className="text-xs text-heading/90 leading-relaxed whitespace-pre-wrap">
                    {isLongDescription && !expandDescription
                      ? `${descriptionText.slice(0, 140)}... `
                      : descriptionText}
                    {isLongDescription && (
                      <button
                        type="button"
                        onClick={() => setExpandDescription((prev) => !prev)}
                        className="text-primary font-semibold hover:underline ml-1"
                      >
                        {expandDescription ? 'Show Less' : 'View More'}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>

          {/* Bottom Block: Thumbnail Lampiran Nota Langsung */}
          <div className="p-6 space-y-3">
            {claim.filePath ? (
              <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-heading">
                    Receipt Attachment
                  </span>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </a>
                </div>

                {isImageReceipt ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="group relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
                      aria-label="Open full receipt image preview"
                    >
                      <img
                        src={receiptUrl}
                        alt={`Receipt uploaded by ${claim.employeeName}`}
                        width={320}
                        height={180}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Eye className="h-4 w-4" aria-hidden="true" /> Click to enlarge
                      </span>
                    </button>
                    <p className="text-xs text-muted-foreground truncate">
                      {receiptFileName}
                    </p>
                  </div>
                ) : isPdfReceipt ? (
                  <div className="space-y-2">
                    <div className="group relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted/30">
                      <iframe
                        src={`${receiptUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        title="PDF Receipt Attachment Thumbnail"
                        className="w-full h-full pointer-events-none"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 cursor-pointer backdrop-blur-2xs"
                        aria-label="Open full receipt PDF preview"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" /> View PDF Fullscreen
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{receiptFileName}</span>
                      <span className="shrink-0 text-2xs uppercase px-1.5 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold ml-2">PDF</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText
                        className="h-6 w-6 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-heading truncate">
                          {receiptFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supporting Document
                        </p>
                      </div>
                    </div>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline shrink-0 ml-2"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Open
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/10 p-4 text-xs text-muted-foreground text-center">
                No receipt attachment uploaded.
              </div>
            )}
          </div>
        </aside>

        {/* ================= RIGHT PANE: CLAIM PROCESS (SINGLE VIEW) ================= */}
        <section className="lg:col-span-8 xl:col-span-9 p-6 lg:p-8 space-y-6 bg-muted/10">
          {/* Top Header & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-heading">Claim Process</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${getClaimBadgeClass(
                  claim.status,
                )}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {statusDisplayLabel}
              </span>
            </div>

            {/* Action Buttons (Revision, Reject, Approval, Disburse, Resubmit) */}
            <div className="flex flex-wrap items-center gap-2">
                {canResubmitClaim && (
                  <Link
                    to="/claims/$claimId/edit"
                    params={{ claimId: claim.id }}
                  >
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5"
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" /> Edit & Resubmit Claim
                    </Button>
                  </Link>
                )}

                {showApprovalActions && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-border text-heading hover:bg-muted font-semibold"
                      onClick={() => {
                        setActionType('NeedsRevision')
                        setNotes('')
                        setDialogOpen(true)
                      }}
                    >
                      Request Revision
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40 font-semibold gap-1.5"
                      onClick={() => {
                        setActionType('Rejected')
                        setNotes('')
                        setDialogOpen(true)
                      }}
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" /> Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                      onClick={() => {
                        setActionType('Approved')
                        setNotes('')
                        setDialogOpen(true)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {claim.status === 'Submitted'
                        ? 'Approve (Manager)'
                        : 'Approve (Finance)'}
                    </Button>
                  </>
                )}

                {canDisburseAndPay && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1.5"
                    onClick={() => {
                      setActionType('Pay')
                      setNotes('')
                      setDialogOpen(true)
                    }}
                  >
                    <DollarSign className="h-4 w-4" aria-hidden="true" /> Disburse & Mark Paid
                  </Button>
                )}
              </div>
          </div>

          {/* Vertical Process Timeline Cards */}
          <div className="relative pl-10 space-y-6">
            {/* STAGE 3: FINANCE VERIFICATION & DISBURSEMENT (Level 2) */}
            {(claim.status === 'UnderReview' ||
              claim.status === 'Approved' ||
              claim.status === 'Paid' ||
              level2Approval ||
              isLevel2Rejected) && (
              <div className="relative">
                {/* Connecting line down to Stage 2 */}
                <div
                  className="absolute -left-6 top-7 h-[calc(100%+1.5rem)] w-0.5 bg-border pointer-events-none"
                  aria-hidden="true"
                />
                {/* Timeline Status Node */}
                <div
                  className={`absolute -left-10 top-3 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 ${
                    claim.status === 'Approved' || claim.status === 'Paid'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400'
                      : isLevel2Rejected
                        ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-400'
                        : 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-400'
                  }`}
                >
                  {claim.status === 'Approved' || claim.status === 'Paid' ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : isLevel2Rejected ? (
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-heading">
                      Finance Verification & Disbursement (Level 2)
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <span
                          className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center"
                          aria-hidden="true"
                        >
                          {getInitials(level2Approval?.approverName || 'Finance')}
                        </span>
                        <span>
                          {level2Approval?.approverName || 'Finance Officer'}
                        </span>
                      </div>
                      {claim.filePath && (
                        <button
                          type="button"
                          onClick={() => setPreviewOpen(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs font-semibold text-heading hover:bg-muted transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                    {/* Signature Date Box */}
                    {(() => {
                      const dBox = formatDateBox(
                        level2Approval?.decidedAt,
                      )
                      return (
                        <div className="w-full sm:w-28 shrink-0 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900 p-3 text-center">
                          <div className="text-2xl font-extrabold text-sky-950 dark:text-sky-200 leading-none">
                            {dBox.day}
                          </div>
                          <div className="text-xs text-sky-800 dark:text-sky-300 mt-1 pb-2 border-b border-sky-200 dark:border-sky-800">
                            {dBox.monthYear}
                          </div>
                          <div className="text-xs font-semibold text-sky-950 dark:text-sky-200 pt-1.5">
                            {dBox.time}
                          </div>
                        </div>
                      )
                    })()}

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex items-center gap-2.5 pb-1">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                          <FileCheck className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-heading leading-tight">
                            Finance & Accounting Department
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Verification • {idNumberFormatter.format(claim.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Verification Checklist Rows */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-heading">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isLevel2Rejected
                                ? 'bg-rose-600'
                                : claim.status === 'Approved' || claim.status === 'Paid'
                                  ? 'bg-emerald-600'
                                  : 'bg-emerald-600'
                            }`}
                          />
                          <span>Benefit Quota & Budget Verification</span>
                        </div>
                        {claim.status === 'Approved' || claim.status === 'Paid' ? (
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-600 shrink-0"
                            aria-hidden="true"
                          />
                        ) : isLevel2Rejected ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                            <XCircle className="h-4 w-4" aria-hidden="true" /> Rejected
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            In Review
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-heading">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isLevel2Rejected
                                ? 'bg-rose-600'
                                : claim.status === 'Paid'
                                  ? 'bg-emerald-600'
                                  : 'bg-sky-600'
                            }`}
                          />
                          <span>Payroll Disbursement Settlement</span>
                        </div>
                        {claim.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Paid
                          </span>
                        ) : isLevel2Rejected ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                            <XCircle className="h-4 w-4" aria-hidden="true" /> Rejected
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-medium">
                            {claim.status === 'Approved'
                              ? 'Awaiting Disbursement'
                              : 'Pending Approval'}
                          </span>
                        )}
                      </div>

                      {level2Approval?.notes && (
                        <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                          <span className="text-xs text-muted-foreground block">
                            Finance Reviewer Notes
                          </span>
                          <p className="text-xs font-medium text-heading leading-relaxed">
                            {level2Approval.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 2: DIRECT MANAGER APPROVAL & DOCUMENT COLLECTION (Level 1) */}
            <div className="relative">
              {/* Connecting line down to Stage 1 (Claim Intimation) */}
              <div
                className="absolute -left-6 top-7 h-[calc(100%+1.5rem)] w-0.5 bg-border pointer-events-none"
                aria-hidden="true"
              />
              <div
                className={`absolute -left-10 top-3 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  level1Approval?.decision === 'Approved' ||
                  claim.status === 'UnderReview' ||
                  claim.status === 'Approved' ||
                  claim.status === 'Paid'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400'
                    : isLevel1Rejected
                      ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-400'
                      : 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-400'
                }`}
              >
                {level1Approval?.decision === 'Approved' ||
                claim.status === 'UnderReview' ||
                claim.status === 'Approved' ||
                claim.status === 'Paid' ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : isLevel1Rejected ? (
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Clock className="h-4 w-4" aria-hidden="true" />
                )}
              </div>

              <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-heading">
                    Document Collection & Manager Approval (Level 1)
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span
                        className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {getInitials(managerDisplayName)}
                      </span>
                      <span>
                        {managerDisplayName}
                      </span>
                    </div>
                    {claim.filePath && (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs font-semibold text-heading hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                  {(() => {
                    const dBox = formatDateBox(
                      level1Approval?.decidedAt,
                    )
                    return (
                      <div className="w-full sm:w-28 shrink-0 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900 p-3 text-center">
                        <div className="text-2xl font-extrabold text-sky-950 dark:text-sky-200 leading-none">
                          {dBox.day}
                        </div>
                        <div className="text-xs text-sky-800 dark:text-sky-300 mt-1 pb-2 border-b border-sky-200 dark:border-sky-800">
                          {dBox.monthYear}
                        </div>
                        <div className="text-xs font-semibold text-sky-950 dark:text-sky-200 pt-1.5">
                          {dBox.time}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex items-center gap-2.5 min-h-8">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-bold text-heading">
                        {claim.departmentName ? `${claim.departmentName} Manager` : 'Engineering Manager'}
                      </p>
                    </div>

                    {/* Receipt Document Item Row */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-heading min-w-0">
                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="truncate">
                          {receiptFileName || 'Supporting Receipt Document'}
                        </span>
                      </div>
                      {claim.filePath ? (
                        <div className="flex items-center gap-2.5 shrink-0">
                          <a
                            href={receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            Download
                          </a>
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-600"
                            aria-hidden="true"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No file</span>
                      )}
                    </div>

                    {/* Manager Approval Decision Row */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-heading">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            level1Approval?.decision === 'Approved'
                              ? 'bg-emerald-500'
                              : isLevel1Rejected
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                          }`}
                        />
                        <span>Direct Manager Decision</span>
                      </div>
                      {level1Approval ? (
                        <span className="font-bold flex items-center gap-1">
                          {level1Approval.decision === 'Approved' ? (
                            <>
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-600"
                                aria-hidden="true"
                              />
                              <span className="text-emerald-700 dark:text-emerald-400">
                                Approved
                              </span>
                            </>
                          ) : level1Approval.decision === 'Rejected' ? (
                            <>
                              <XCircle
                                className="h-4 w-4 text-rose-600"
                                aria-hidden="true"
                              />
                              <span className="text-rose-700 dark:text-rose-400">
                                Rejected
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-600">{level1Approval.decision}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          Awaiting Manager Review
                        </span>
                      )}
                    </div>

                    {level1Approval?.notes && (
                      <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                        <span className="text-xs text-muted-foreground block">
                          Manager Notes
                        </span>
                        <p className="text-xs font-medium text-heading leading-relaxed">
                          {level1Approval.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STAGE 1: CLAIM INTIMATION & SUBMISSION */}
            <div className="relative">
              <div className="absolute -left-10 top-3 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-heading">
                    Claim Initialization & Submission
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span
                        className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {getInitials(claim.employeeName)}
                      </span>
                      <span>{claim.employeeName}</span>
                    </div>
                    {claim.filePath && (
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-xs font-semibold text-heading hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-28 shrink-0 rounded-lg bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900 p-3 text-center">
                    <div className="text-2xl font-extrabold text-sky-950 dark:text-sky-200 leading-none">
                      {submittedDateInfo.day}
                    </div>
                    <div className="text-xs text-sky-800 dark:text-sky-300 mt-1 pb-2 border-b border-sky-200 dark:border-sky-800">
                      {submittedDateInfo.monthYear}
                    </div>
                    <div className="text-xs font-semibold text-sky-950 dark:text-sky-200 pt-1.5">
                      {submittedDateInfo.time}
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-h-8">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-bold text-heading">
                          {claim.benefitName ||
                            claim.tripProposalDescription ||
                            claimTypeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                      <span className="text-xs text-muted-foreground block">
                        Claim Description
                      </span>
                      <p className="text-xs font-medium text-heading leading-relaxed whitespace-pre-wrap">
                        {descriptionText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Receipt Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Receipt Attachment Preview</DialogTitle>
            <DialogDescription>
              {receiptFileName} • Uploaded by {claim.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex items-center justify-center bg-muted/20 rounded-lg border border-border overflow-hidden min-h-64 max-h-[75vh]">
            {isImageReceipt ? (
              <img
                src={receiptUrl}
                alt={`Full receipt uploaded by ${claim.employeeName}`}
                width={800}
                height={600}
                className="max-h-[70vh] w-auto object-contain"
              />
            ) : isPdfReceipt ? (
              <iframe
                src={receiptUrl}
                title="Full PDF Receipt"
                className="w-full h-[70vh] rounded border border-border"
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <FileText
                  className="h-12 w-12 text-primary mx-auto"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-heading">
                  {receiptFileName}
                </p>
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Open / Download Document
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            {claim.filePath && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 gap-1.5"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download Original
              </a>
            )}
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval / Rejection / Disbursement Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'Pay'
                ? 'Disburse Claim & Mark Paid'
                : actionType === 'Approved'
                  ? claim.status === 'Submitted'
                    ? 'Approve Claim (Manager Review)'
                    : 'Approve Claim (Finance Review)'
                  : actionType === 'NeedsRevision'
                    ? 'Request Claim Revision'
                    : 'Reject Claim'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'Pay'
                ? `Confirm payment disbursement of ${idNumberFormatter.format(claim.amount)} for this claim.`
                : actionType === 'Approved'
                  ? `Proceed with approving reimbursement amount of ${idNumberFormatter.format(claim.amount)}.`
                  : actionType === 'NeedsRevision'
                    ? 'Return claim to employee with instructions for revision.'
                    : 'Reject this reimbursement claim.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="review-notes" className="text-xs font-semibold">
                {actionType === 'Rejected' || actionType === 'NeedsRevision'
                  ? 'Reason / Instructions (Required)'
                  : 'Review Notes (Optional)'}
              </Label>
              <Textarea
                id="review-notes"
                placeholder={
                  actionType === 'Rejected'
                    ? 'State the reason for rejecting this claim...'
                    : actionType === 'NeedsRevision'
                      ? 'Describe what documents or details need to be corrected by the employee...'
                      : 'Add any optional verification notes...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={
                (actionType === 'Rejected' || actionType === 'NeedsRevision') &&
                !notes.trim()
              }
              className={
                actionType === 'Rejected'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : actionType === 'NeedsRevision'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
              onClick={handleAction}
            >
              Confirm{' '}
              {actionType === 'Pay'
                ? 'Payment'
                : actionType === 'Approved'
                  ? 'Approval'
                  : actionType === 'NeedsRevision'
                    ? 'Revision Request'
                    : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
