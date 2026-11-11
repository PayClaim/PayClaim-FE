import { useMemo, useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '#/features/auth/queries/queries'
import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import { Button } from '#/components/ui/button'

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plane,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'

export const Route = createFileRoute('/_app/trip-proposals/')({
  beforeLoad: ({ context }) => {
    if (context.isAdmin || context.isDirector) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function normalizeStatus(status: string) {
  return (status || '').replace(/[\s_-]/g, '').toLowerCase()
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getProposalStatusConfig(status: string) {
  const norm = normalizeStatus(status)
  switch (norm) {
    case 'submitted':
      return {
        label: 'Submitted',
        className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'underreview':
      return {
        label: 'Under Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'financemanagerreview':
      return {
        label: 'Finance Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        dotColor: 'bg-amber-500',
      }
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
        dotColor: 'bg-blue-600',
      }
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
        dotColor: 'bg-emerald-600',
      }
    case 'needsrevision':
      return {
        label: 'Needs Revision',
        className: 'bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
        dotColor: 'bg-orange-500',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        className: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
        dotColor: 'bg-rose-500',
      }
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        dotColor: 'bg-slate-500',
      }
  }
}

type ProposalTab = 'ALL' | 'WAITING' | 'APPROVED' | 'COMPLETED' | 'REVISION_OR_REJECTED'

function RouteComponent() {
  const navigate = useNavigate()
  const { data: user } = useQuery(getCurrentUser())

  const {
    data: proposals = [],
    isError,
    isFetching,
    error,
  } = useGetAllProposalsQuery(user?.employeeId)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ProposalTab>('ALL')

  // KPI Calculations
  const metrics = useMemo(() => {
    const totalCount = proposals.length
    const totalAmount = proposals.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

    const waiting = proposals.filter((p) => {
      const s = normalizeStatus(p.status)
      return ['submitted', 'underreview', 'financemanagerreview', 'pending'].includes(s)
    })
    const waitingCount = waiting.length
    const waitingAmount = waiting.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

    const approvedCompleted = proposals.filter((p) => {
      const s = normalizeStatus(p.status)
      return ['approved', 'completed'].includes(s)
    })
    const approvedCompletedCount = approvedCompleted.length
    const approvedCompletedAmount = approvedCompleted.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0,
    )

    return {
      totalCount,
      totalAmount,
      waitingCount,
      waitingAmount,
      approvedCompletedCount,
      approvedCompletedAmount,
    }
  }, [proposals])

  // Filtered proposals based on active tab and search query
  const filteredProposals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return proposals.filter((proposal) => {
      const norm = normalizeStatus(proposal.status)

      // Tab filter
      if (activeTab === 'WAITING') {
        if (!['submitted', 'underreview', 'financemanagerreview', 'pending'].includes(norm))
          return false
      } else if (activeTab === 'APPROVED') {
        if (norm !== 'approved') return false
      } else if (activeTab === 'COMPLETED') {
        if (norm !== 'completed') return false
      } else if (activeTab === 'REVISION_OR_REJECTED') {
        if (!['needsrevision', 'rejected', 'cancelled'].includes(norm)) return false
      }

      // Search query
      if (q) {
        const dest = (proposal.destination || '').toLowerCase()
        const pic = (proposal.picName || '').toLowerCase()
        const desc = (proposal.description || '').toLowerCase()
        const id = (proposal.id || '').toLowerCase()

        return dest.includes(q) || pic.includes(q) || desc.includes(q) || id.includes(q)
      }

      return true
    })
  }, [proposals, activeTab, searchQuery])

  if (isError) {
    return (
      <div className="p-8 text-center space-y-3 bg-card rounded-2xl border border-border">
        <p className="font-semibold text-rose-600">Gagal memuat data proposal perjalanan dinas.</p>
        <p className="text-xs text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }

  if (isFetching && proposals.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p className="text-sm">Memuat proposal perjalanan dinas Anda...</p>
      </div>
    )
  }

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            My Trip Proposals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola dan pantau proposal perjalanan dinas Anda (sebagai PIC atau peserta).
          </p>
        </div>

        <Link to="/trip-proposals/create">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-2xs h-9 px-3.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Ajukan Proposal Baru
          </Button>
        </Link>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Proposals */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total Proposal Perjalanan
            </span>
            <div className="w-10 h-10 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-foreground">
            {metrics.totalCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {formatCurrency(metrics.totalAmount)} total estimasi budget
          </p>
        </div>

        {/* KPI 2: Waiting Review */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Menunggu Review
            </span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
            {metrics.waitingCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {formatCurrency(metrics.waitingAmount)} dalam proses approval
          </p>
        </div>

        {/* KPI 3: Approved / Completed */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Disetujui / Selesai
            </span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            {metrics.approvedCompletedCount}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {formatCurrency(metrics.approvedCompletedAmount)} telah disetujui / selesai
          </p>
        </div>
      </div>

      {/* Proposals Table Container */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* Table Header Toolbar: Title on left, Status Pills + Search on right */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground text-base">
              Riwayat Proposal
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pilih proposal untuk melihat timeline persetujuan, daftar peserta, dan dokumen pendukung.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Segmented Status Tabs */}
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('WAITING')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'WAITING'
                    ? 'bg-card text-amber-600 dark:text-amber-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Waiting Review
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('APPROVED')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'APPROVED'
                    ? 'bg-card text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'COMPLETED'
                    ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('REVISION_OR_REJECTED')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'REVISION_OR_REJECTED'
                    ? 'bg-card text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Revision / Rejected
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari destinasi, PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-muted/40 border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Destinasi & ID</th>
                <th className="py-3 px-5">Periode Perjalanan</th>
                <th className="py-3 px-5">Peran / PIC</th>
                <th className="py-3 px-5">Peserta</th>
                <th className="py-3 px-5 text-right">Estimasi Biaya</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProposals.map((proposal) => {
                const statusConfig = getProposalStatusConfig(proposal.status)

                const isCurrentUserPic = Boolean(
                  (proposal.picEmployeeId &&
                    user?.employeeId &&
                    proposal.picEmployeeId.toLowerCase() ===
                      user.employeeId.toLowerCase()) ||
                  (user?.fullName &&
                    proposal.picName &&
                    user.fullName.trim().toLowerCase() ===
                      proposal.picName.trim().toLowerCase()),
                )

                return (
                  <tr
                    key={proposal.id}
                    onClick={() =>
                      navigate({
                        to: '/trip-proposals/$id',
                        params: { id: proposal.id },
                      })
                    }
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    {/* Destinasi & ID */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-foreground text-sm">
                        {proposal.destination}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        ID: TRIP-{proposal.id.slice(0, 8).toUpperCase()}
                      </div>
                    </td>

                    {/* Periode Perjalanan */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{formatDate(proposal.startDate)}</span>
                        <span className="text-muted-foreground">s/d</span>
                        <span>{formatDate(proposal.endDate)}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Diajukan: {formatDate(proposal.submittedAt)}
                      </div>
                    </td>

                    {/* Peran / PIC */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0">
                          {getInitials(proposal.picName)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground text-xs block">
                            {proposal.picName || '-'}
                          </span>
                          {isCurrentUserPic ? (
                            <span className="inline-flex items-center rounded px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 text-[10px] font-bold">
                              PIC (You)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[10px] font-medium">
                              Participant
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Peserta */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/40 border border-border">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{proposal.participantCount} Orang</span>
                      </span>
                    </td>

                    {/* Estimasi Biaya */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(proposal.totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.className}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}
                        />
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-muted-foreground/40" />
                      <p className="font-medium">Tidak ada proposal perjalanan yang ditemukan</p>
                      <p className="text-xs text-muted-foreground/80">
                        {searchQuery || activeTab !== 'ALL'
                          ? 'Coba ubah kata kunci pencarian atau tab status.'
                          : 'Anda belum terdaftar dalam proposal perjalanan dinas mana pun.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
          <span>Menampilkan {filteredProposals.length} dari {proposals.length} total proposal</span>
          {activeTab !== 'ALL' && (
            <span className="font-medium text-foreground">
              Filter aktif: {activeTab}
            </span>
          )}
        </div>
      </section>
    </main>
  )
}
