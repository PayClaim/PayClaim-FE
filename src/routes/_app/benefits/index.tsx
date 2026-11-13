import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  HeartPulse,
  Layers,
  Plus,
  Receipt,
  Search,
  SearchX,
  ShieldAlert,
  Tag,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_app/benefits/')({
  component: RouteComponent,
})

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getDaysRemaining(endDateStr?: string | null): number | null {
  if (!endDateStr) return null
  try {
    const end = new Date(endDateStr)
    if (isNaN(end.getTime())) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

function getCategoryIcon(categoryName?: string | null) {
  const cat = (categoryName || '').toLowerCase()
  if (
    cat.includes('sehat') ||
    cat.includes('medis') ||
    cat.includes('health') ||
    cat.includes('rawat') ||
    cat.includes('gym') ||
    cat.includes('kebugaran')
  ) {
    return HeartPulse
  }
  if (
    cat.includes('transport') ||
    cat.includes('kendaraan') ||
    cat.includes('bbm') ||
    cat.includes('travel')
  ) {
    return Receipt
  }
  return Tag
}

function formatPeriodLabel(periodType?: string | null): string {
  const p = (periodType || '').toLowerCase()
  if (p === 'annual' || p === 'yearly') return 'Plafon Tahunan'
  if (p === 'monthly') return 'Plafon Bulanan'
  if (p === 'quarterly') return 'Plafon Kuartalan'
  if (p === 'perevent' || p === 'perclaim') return 'Per Pengajuan'
  return periodType ? `Periode ${periodType}` : 'Plafon Reguler'
}

type SortOption =
  | 'DEFAULT'
  | 'BALANCE_DESC'
  | 'BALANCE_ASC'
  | 'NAME_ASC'
  | 'NAME_DESC'

function RouteComponent() {
  const {
    data: benefits = [],
    isLoading,
    isError,
  } = useGetAllEmployeeBenefitsQuery()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'DEPLETED'>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('DEFAULT')

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    benefits.forEach((b) => {
      if (b.categoryName) set.add(b.categoryName)
    })
    return Array.from(set).sort()
  }, [benefits])

  // KPI Calculations
  const metrics = useMemo(() => {
    const activeBenefits = benefits.filter((b) => b.isActive)
    const totalBalance = activeBenefits.reduce(
      (sum, b) => sum + (Number(b.balance) || 0),
      0,
    )
    const activeWithBalanceCount = activeBenefits.filter(
      (b) => Number(b.balance) > 0,
    ).length

    // Find closest expiration date among active benefits
    let closestEndDate: string | null = null
    let minDays: number = Number.MAX_SAFE_INTEGER

    activeBenefits.forEach((b) => {
      const days = getDaysRemaining(b.endDate)
      if (days !== null && days >= 0 && days < minDays) {
        minDays = days
        closestEndDate = b.endDate
      }
    })

    return {
      totalBalance,
      activeWithBalanceCount,
      totalCount: benefits.length,
      categoriesCount: categories.length || 1,
      closestEndDate,
      minDays: minDays === Number.MAX_SAFE_INTEGER ? null : minDays,
    }
  }, [benefits, categories])

  // Filtered & Sorted benefits list
  const sortedAndFilteredBenefits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = benefits.filter((b) => {
      const matchSearch =
        !q ||
        b.benefitName.toLowerCase().includes(q) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(q))

      const matchCat =
        selectedCategory === 'ALL' || (b.categoryName || 'General') === selectedCategory

      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && b.isActive && Number(b.balance) > 0) ||
        (selectedStatus === 'DEPLETED' && (!b.isActive || Number(b.balance) <= 0))

      return matchSearch && matchCat && matchStatus
    })

    return list.sort((a, b) => {
      if (sortBy === 'BALANCE_DESC') {
        return (Number(b.balance) || 0) - (Number(a.balance) || 0)
      }
      if (sortBy === 'BALANCE_ASC') {
        return (Number(a.balance) || 0) - (Number(b.balance) || 0)
      }
      if (sortBy === 'NAME_ASC') {
        return a.benefitName.localeCompare(b.benefitName)
      }
      if (sortBy === 'NAME_DESC') {
        return b.benefitName.localeCompare(a.benefitName)
      }
      // DEFAULT: Prioritize active with soonest expiry
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
      const timeA = a.endDate ? new Date(a.endDate).getTime() : 0
      const timeB = b.endDate ? new Date(b.endDate).getTime() : 0
      return timeA - timeB
    })
  }, [benefits, searchQuery, selectedCategory, selectedStatus, sortBy])

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            My Benefits
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor your active benefit allocations, remaining balance quota, and submit benefit claims.
          </p>
        </div>

        <Link to="/claims/create">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-2xs h-9 px-3.5"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Submit New Claim
          </Button>
        </Link>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total Saldo Tersedia */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Available Balance
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-heading">
            {idNumberFormatter.format(metrics.totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Accumulated active claim balance ready to use
          </p>
        </div>

        {/* KPI 2: Active Benefit Programs */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Programs
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-heading">
            {metrics.activeWithBalanceCount}{' '}
            <span className="text-sm font-sans font-medium text-muted-foreground">
              / {metrics.totalCount} Benefits
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.categoriesCount} registered benefit categories
          </p>
        </div>

        {/* KPI 3: Nearest Expiry */}
        <div className="bg-card rounded-xl border border-border p-4.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Nearest Period Limit
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-heading">
            {metrics.closestEndDate ? formatDate(metrics.closestEndDate) : '-'}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.minDays !== null
              ? `Berakhir dalam ${metrics.minDays} hari ke depan`
              : 'Tidak ada plafon yang segera berakhir'}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* UNIFIED CONTAINER: Combined Toolbar (Search, Sort, Filter) & Benefit Cards */}
      {/* ============================================================== */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {/* Integrated Top Header Toolbar: Search on Left, Filters on Right */}
        <div className="p-3.5 sm:p-4 border-b border-border bg-slate-50/70 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Search Input */}
          <div className="relative w-full md:w-72 lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search benefits or categories..."
              className="pl-9 pr-8 h-9 text-xs bg-card border-border w-full shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filters, Sort & Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs font-medium rounded-lg border border-border bg-card text-heading focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
              aria-label="Filter kategori"
            >
              <option value="ALL">Semua Kategori ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 pl-3 pr-8 text-xs font-medium rounded-lg border border-border bg-card text-heading focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer appearance-none shadow-2xs"
                aria-label="Urutkan tunjangan"
              >
                <option value="DEFAULT">Urutkan: Masa Berlaku Terdekat</option>
                <option value="BALANCE_DESC">Saldo: Tertinggi ke Terendah</option>
                <option value="BALANCE_ASC">Saldo: Terendah ke Tertinggi</option>
                <option value="NAME_ASC">Nama: A ke Z</option>
                <option value="NAME_DESC">Nama: Z ke A</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Status Quick Filter Tabs */}
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-xs shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStatus('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedStatus === 'ALL'
                    ? 'bg-card text-heading shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-heading'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('ACTIVE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedStatus === 'ACTIVE'
                    ? 'bg-card text-heading shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-heading'
                }`}
              >
                Tersedia
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('DEPLETED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedStatus === 'DEPLETED'
                    ? 'bg-card text-heading shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-heading'
                }`}
              >
                Habis / Nonaktif
              </button>
            </div>
          </div>
        </div>

        {/* Integrated Content Body Area: Benefit Cards Grid */}
        <div className="p-5 sm:p-6 bg-card">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium">Loading your benefit allocations...</p>
            </div>
          ) : isError ? (
            <div className="p-8 rounded-xl border border-destructive/60 bg-destructive/5 text-destructive text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
              <p className="font-semibold text-sm">Failed to load benefit allocations</p>
              <p className="text-xs text-muted-foreground">
                Pastikan koneksi backend aktif dan token autentikasi Anda masih valid.
              </p>
            </div>
          ) : benefits.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <h2 className="text-lg font-bold text-heading">
                Belum Ada Alokasi Benefit
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Akun Anda belum memiliki kuota benefit aktif yang dialokasikan oleh HR. Hubungi departemen People & Culture / HR untuk informasi hak tunjangan Anda.
              </p>
            </div>
          ) : sortedAndFilteredBenefits.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <SearchX className="h-9 w-9 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-semibold text-heading">
                Tidak ada benefit yang cocok dengan filter
              </p>
              <p className="text-xs text-muted-foreground">
                Coba ubah kata kunci pencarian atau reset filter kategori, urutan, atau status Anda.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('ALL')
                  setSelectedStatus('ALL')
                  setSortBy('DEFAULT')
                }}
                className="text-xs h-8"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedAndFilteredBenefits.map((benefit) => {
                const balanceNum = Number(benefit.balance) || 0
                const isAvailable = benefit.isActive && balanceNum > 0
                const isDepleted = benefit.isActive && balanceNum <= 0
                const isInactive = !benefit.isActive
                const CategoryIcon = getCategoryIcon(benefit.categoryName)
                const daysRemaining = getDaysRemaining(benefit.endDate)

                return (
                  <div
                    key={benefit.employeeBenefitId}
                    className="bg-background dark:bg-slate-900/60 rounded-xl border border-border/80 p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Category Pill & Status Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        {/* Category Pill with Semantic Icon */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 text-heading border border-border/80">
                          <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                          <span>{benefit.categoryName || 'General'}</span>
                        </span>

                        {/* Accurate Status Indicator */}
                        {isAvailable && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                            Aktif
                          </span>
                        )}
                        {isDepleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Kuota Habis
                          </span>
                        )}
                        {isInactive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                            <ShieldAlert className="w-3 h-3 text-muted-foreground" />
                            Tidak Aktif
                          </span>
                        )}
                      </div>

                      {/* Benefit Title & Period Type */}
                      <div>
                        <h3 className="font-bold text-base text-heading leading-snug line-clamp-2 min-h-[2.5rem]">
                          {benefit.benefitName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span>{formatPeriodLabel(benefit.periodType)}</span>
                        </div>
                      </div>

                      {/* Quota Balance Box */}
                      <div className="rounded-xl bg-card border border-border/80 p-3.5 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium uppercase tracking-wider text-[11px]">
                            Sisa Plafon Saldo
                          </span>
                          {isAvailable && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Tersedia
                            </span>
                          )}
                        </div>

                        <div
                          className={`text-2xl font-bold tabular-nums tracking-tight ${
                            isAvailable
                              ? 'text-heading'
                              : 'text-muted-foreground line-through decoration-muted-foreground/40'
                          }`}
                        >
                          {idNumberFormatter.format(balanceNum)}
                        </div>

                        <div className="pt-0.5">
                          {isAvailable ? (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                              Dapat diajukan untuk klaim reimbursement
                            </p>
                          ) : isDepleted ? (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                              Plafon kuota telah habis untuk periode ini
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground font-medium">
                              Periode manfaat belum dimulai atau telah berakhir
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Validity Period & Direct Action Button */}
                    <div className="space-y-3 pt-2 border-t border-border/80">
                      {/* Validity Dates & Days Remaining */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">
                            {formatDate(benefit.startDate)} – {formatDate(benefit.endDate)}
                          </span>
                        </div>

                        {daysRemaining !== null && benefit.isActive && (
                          <span
                            className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-sm ${
                              daysRemaining <= 30
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {daysRemaining > 0
                              ? `Sisa ${daysRemaining} hari`
                              : 'Berakhir hari ini'}
                          </span>
                        )}
                      </div>

                      {/* Action CTA Button */}
                      {isAvailable ? (
                        <Link
                          to="/claims/create"
                          search={{ employeeBenefitId: benefit.employeeBenefitId }}
                          className="block w-full"
                        >
                          <Button
                            size="sm"
                            className="w-full h-9 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Submit Claim</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          variant="outline"
                          className="w-full h-9 rounded-lg font-medium text-xs text-muted-foreground border-border bg-muted/10 cursor-not-allowed"
                        >
                          {isDepleted ? 'Plafon Habis' : 'Benefit Tidak Aktif'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
