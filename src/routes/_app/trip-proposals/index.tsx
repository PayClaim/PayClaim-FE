import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  useGetAllTripProposalsQuery,
  useGetTripProposalByIdQuery,
} from '#/features/trip-proposals/queries/getAllProposals'
import type { TripProposalStatus } from '#/types/tripProposals.type'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '#/components/ui/dialog'
import {
  Plane,
  Calendar,
  Users,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/_app/trip-proposals/')({
  component: TripProposalsPage,
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusBadge = (status: TripProposalStatus | string) => {
  switch (status) {
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      )
    case 'Submitted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          Submitted
        </span>
      )
    case 'UnderReview':
    case 'FinanceManagerReview':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Clock className="w-3.5 h-3.5" />
          In Review
        </span>
      )
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      )
    case 'NeedsRevision':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          Needs Revision
        </span>
      )
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          <HelpCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      )
  }
}

function TripProposalsPage() {
  const { data: proposals = [], isLoading } = useGetAllTripProposalsQuery()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null)

  const backendBaseUrl = (
    import.meta.env.VITE_API_URL || 'http://localhost:5109'
  ).replace(/\/api\/?$/, '')

  // Filter & Urutkan Terbaru (SubmittedAt DESC)
  const filteredAndSortedProposals = [...proposals]
    .filter((tp) => {
      const matchSearch =
        !search ||
        tp.destination.toLowerCase().includes(search.toLowerCase()) ||
        (tp.picName && tp.picName.toLowerCase().includes(search.toLowerCase()))

      const matchStatus =
        statusFilter === 'ALL' || tp.status === statusFilter

      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      if (timeB !== timeA) return timeB - timeA
      const startA = a.startDate ? new Date(a.startDate).getTime() : 0
      const startB = b.startDate ? new Date(b.startDate).getTime() : 0
      return startB - startA
    })

  // Quick stats
  const totalCount = proposals.length
  const pendingCount = proposals.filter((p) =>
    ['Submitted', 'UnderReview', 'FinanceManagerReview'].includes(p.status),
  ).length
  const approvedCount = proposals.filter((p) =>
    ['Approved', 'Completed'].includes(p.status),
  ).length
  const revisionOrRejectedCount = proposals.filter((p) =>
    ['NeedsRevision', 'Rejected'].includes(p.status),
  ).length

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">Trip Proposals</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary">
              {proposals.length} Total
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar proposal perjalanan dinas diurutkan dari yang terbaru diajukan.
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Pengajuan
          </p>
          <p className="text-2xl font-black mt-1 text-foreground">{totalCount}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold text-amber-500 uppercase">
            Menunggu Review
          </p>
          <p className="text-2xl font-black mt-1 text-amber-500">{pendingCount}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold text-emerald-500 uppercase">
            Disetujui / Selesai
          </p>
          <p className="text-2xl font-black mt-1 text-emerald-500">{approvedCount}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
          <p className="text-xs font-semibold text-rose-500 uppercase">
            Perlu Revisi / Ditolak
          </p>
          <p className="text-2xl font-black mt-1 text-rose-500">
            {revisionOrRejectedCount}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari destinasi atau PIC..."
            className="pl-9 h-10 bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {(
            [
              'ALL',
              'Submitted',
              'UnderReview',
              'Approved',
              'Completed',
              'NeedsRevision',
              'Rejected',
            ] as const
          ).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Memuat data proposal perjalanan...</p>
          </div>
        ) : filteredAndSortedProposals.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Plane className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-base">Tidak ada proposal perjalanan ditemukan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'Coba sesuaikan kata kunci pencarian atau filter status Anda.'
                : 'Belum ada pengajuan proposal perjalanan dinas yang tercatat.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/30">
                  <TableHead className="font-bold text-xs">DESTINASI</TableHead>
                  <TableHead className="font-bold text-xs">PERIODE PERJALANAN</TableHead>
                  <TableHead className="font-bold text-xs">PIC & PESERTA</TableHead>
                  <TableHead className="font-bold text-xs">TOTAL ANGGARAN</TableHead>
                  <TableHead className="font-bold text-xs">DIAJUKAN</TableHead>
                  <TableHead className="font-bold text-xs">STATUS</TableHead>
                  <TableHead className="font-bold text-xs text-right">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProposals.map((tp) => (
                  <TableRow
                    key={tp.id}
                    className="hover:bg-muted/40 transition-colors border-b border-border"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Plane className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {tp.destination}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {tp.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {formatDate(tp.startDate)} - {formatDate(tp.endDate)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">
                          {tp.picName || '-'}
                        </p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{tp.participantCount} Peserta</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-sm text-primary">
                      {formatCurrency(tp.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(tp.submittedAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(tp.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProposalId(tp.id)}
                        className="text-xs font-semibold gap-1 h-8"
                      >
                        Detail
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Proposal Detail Dialog with Newest-First Approval Timeline */}
      <TripProposalDetailModal
        proposalId={selectedProposalId}
        onClose={() => setSelectedProposalId(null)}
        backendBaseUrl={backendBaseUrl}
      />
    </main>
  )
}

function TripProposalDetailModal({
  proposalId,
  onClose,
  backendBaseUrl,
}: {
  proposalId: string | null
  onClose: () => void
  backendBaseUrl: string
}) {
  const { data: detail, isLoading } = useGetTripProposalByIdQuery(proposalId)

  // Sort Approval History dari aksi terbaru ke terlama
  const sortedApprovalHistory = [...(detail?.approvalHistory || [])].sort(
    (a, b) => {
      const timeA = a.decidedAt ? new Date(a.decidedAt).getTime() : 0
      const timeB = b.decidedAt ? new Date(b.decidedAt).getTime() : 0
      return timeB - timeA
    },
  )

  const reportUrl = detail?.filePath
    ? detail.filePath.startsWith('http')
      ? detail.filePath
      : `${backendBaseUrl}${detail.filePath.startsWith('/') ? '' : '/'}${detail.filePath}`
    : null

  return (
    <Dialog open={!!proposalId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                {detail?.destination || 'Proposal Detail'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-1">
                Diajukan pada {formatDateTime(detail?.submittedAt)}
              </DialogDescription>
            </div>
            {detail && getStatusBadge(detail.status)}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center space-y-2">
            <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Memuat rincian proposal...</p>
          </div>
        ) : detail ? (
          <div className="space-y-6 pt-2">
            {/* Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs">
              <div>
                <p className="text-muted-foreground font-semibold">Periode</p>
                <p className="font-bold text-foreground mt-0.5">
                  {formatDate(detail.startDate)} - {formatDate(detail.endDate)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Total Anggaran</p>
                <p className="font-bold text-primary mt-0.5">
                  {formatCurrency(detail.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Lampiran / Laporan</p>
                {reportUrl ? (
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline mt-0.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Unduh Dokumen
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-muted-foreground mt-0.5 italic">Tidak ada file</p>
                )}
              </div>
            </div>

            {/* Description / Purpose */}
            {detail.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Keperluan / Deskripsi Perjalanan
                </h4>
                <div className="p-3 rounded-lg bg-card border border-border text-xs leading-relaxed text-foreground">
                  {detail.description}
                </div>
              </div>
            )}

            {/* Participants Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Peserta Perjalanan ({detail.participants.length})
              </h4>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 text-xs">
                      <TableHead className="py-2">Nama Karyawan</TableHead>
                      <TableHead className="py-2">Peran</TableHead>
                      <TableHead className="py-2 text-right">Alokasi Biaya</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.participants.map((p) => (
                      <TableRow key={p.employeeId} className="text-xs border-b border-border">
                        <TableCell className="font-semibold py-2">
                          {p.employeeName || p.employeeId}
                          {p.employeeNumber && (
                            <span className="block text-[11px] text-muted-foreground font-mono">
                              {p.employeeNumber}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          {p.isPic ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                              PIC / Ketua
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Peserta</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-right font-medium">
                          {formatCurrency(p.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Approval History Timeline (Sorted Newest First) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Riwayat Persetujuan</span>
                <span className="text-[11px] font-normal lowercase">(terbaru di atas)</span>
              </h4>

              {sortedApprovalHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/20 border border-border">
                  Belum ada catatan persetujuan untuk pengajuan ini.
                </p>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {sortedApprovalHistory.map((h) => (
                    <div key={h.id} className="relative pl-7 text-xs space-y-1">
                      <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {h.approverName || 'Approver'} (Level {h.approvalLevel})
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {formatDateTime(h.decidedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                            h.decision === 'Approved'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : h.decision === 'NeedsRevision'
                                ? 'bg-orange-500/15 text-orange-600'
                                : 'bg-rose-500/15 text-rose-600'
                          }`}
                        >
                          {h.decision}
                        </span>
                      </div>
                      {h.notes && (
                        <p className="text-muted-foreground bg-muted/30 p-2 rounded border border-border mt-1">
                          "{h.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
