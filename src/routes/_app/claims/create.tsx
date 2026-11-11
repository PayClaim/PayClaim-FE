import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { ButtonGroup } from '#/components/ui/button-group'
import { Label } from '#/components/ui/label'
import { useEffect, useMemo, useState } from 'react'
import { createClaimForm } from '#/features/claims/forms/forms'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { useGetAllTripProposalsQuery } from '#/features/trip-proposals/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { toDateOnly } from '#/lib/utils'
import { toast } from 'sonner'
import { ArrowLeft, Send } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import type { SelectOptionGroup } from '#/components/forms/FormSelect'

interface ClaimCreateSearchParams {
  employeeBenefitId?: string
  tripProposalId?: string
  claimType?: string
}

export const Route = createFileRoute('/_app/claims/create')({
  validateSearch: (search: Record<string, unknown>): ClaimCreateSearchParams => ({
    employeeBenefitId:
      typeof search.employeeBenefitId === 'string'
        ? search.employeeBenefitId
        : undefined,
    tripProposalId:
      typeof search.tripProposalId === 'string'
        ? search.tripProposalId
        : undefined,
    claimType:
      typeof search.claimType === 'string'
        ? search.claimType
        : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.isAdmin || context.isDirector) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {
    employeeBenefitId: searchBenefitId,
    tripProposalId: searchTripId,
    claimType: searchClaimType,
  } = Route.useSearch()
  const { data: empBenefits = [] } = useGetAllEmployeeBenefitsQuery()
  const { data: tripProposals = [] } = useGetAllTripProposalsQuery()
  const [dialogOpen, setDialogOpen] = useState(false)

  const [currentClaimType, setClaimType] = useState('Benefit')
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(
    searchBenefitId ?? null,
  )
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    searchTripId ?? null,
  )

  const claimTypeSelect = [
    { label: 'Benefit', value: 'Benefit' },
    { label: 'Operational', value: 'OperationalReimbursement' },
    { label: 'Trip', value: 'BusinessTripReimbursement' },
  ]

  const handleClaimTypeClick = (value: string) => {
    setClaimType(value)
    form.setFieldValue('claimType', value)
    form.setFieldValue('employeeBenefitId', null)
    form.setFieldValue('tripProposalId', null)
    setSelectedBenefitId(null)
    setSelectedTripId(null)
    if (value !== 'BusinessTripReimbursement') {
      form.setFieldValue('transactionDate', toDateOnly(new Date()))
    }
  }

  const approvedTrips = tripProposals.filter((t) => {
    const s = String(t.status).toLowerCase()
    const isApproved =
      s === 'approved' || s === 'completed' || s === '4' || s === '6'
    const hasParticipantBudget =
      t.myParticipantAmount !== undefined && t.myParticipantAmount !== null
        ? t.myParticipantAmount > 0
        : true
    return isApproved && hasParticipantBudget
  })

  const tripSelect = approvedTrips.map((t) => {
    const budget =
      t.myRemainingBudget ?? t.myParticipantAmount ?? t.totalAmount
    return {
      label: `${t.destination} (Plafon: ${idNumberFormatter.format(budget)})`,
      value: t.id,
    }
  })

  // Kelompokkan Benefit berdasarkan Kategori
  const benefitGroups: SelectOptionGroup[] = useMemo(() => {
    const groupMap = new Map<string, Array<{ label: string; value: string }>>()
    empBenefits.forEach((b) => {
      const category = b.categoryName?.trim() || 'General Benefits'
      if (!groupMap.has(category)) {
        groupMap.set(category, [])
      }
      groupMap.get(category)!.push({
        label: `${b.benefitName} (Sisa: ${idNumberFormatter.format(b.balance)})`,
        value: b.employeeBenefitId,
      })
    })

    return Array.from(groupMap.entries()).map(([groupLabel, items]) => ({
      groupLabel,
      items,
    }))
  }, [empBenefits])

  const form = createClaimForm(searchBenefitId)

  useEffect(() => {
    if (searchTripId) {
      setClaimType('BusinessTripReimbursement')
      form.setFieldValue('claimType', 'BusinessTripReimbursement')
      form.setFieldValue('tripProposalId', searchTripId)
      form.setFieldValue('employeeBenefitId', null)
      setSelectedTripId(searchTripId)
      setSelectedBenefitId(null)
    } else if (searchBenefitId) {
      setClaimType('Benefit')
      form.setFieldValue('claimType', 'Benefit')
      form.setFieldValue('employeeBenefitId', searchBenefitId)
      form.setFieldValue('tripProposalId', null)
      setSelectedBenefitId(searchBenefitId)
      setSelectedTripId(null)
    } else if (searchClaimType) {
      setClaimType(searchClaimType)
      form.setFieldValue('claimType', searchClaimType)
    }
  }, [searchBenefitId, searchTripId, searchClaimType])

  const selectedTrip = approvedTrips.find(
    (t) => t.id === (form.state.values.tripProposalId || selectedTripId),
  )

  useEffect(() => {
    if (currentClaimType === 'BusinessTripReimbursement' && selectedTrip) {
      const curDate = form.state.values.transactionDate
      if (
        !curDate ||
        curDate < selectedTrip.startDate ||
        curDate > selectedTrip.endDate
      ) {
        form.setFieldValue('transactionDate', selectedTrip.startDate)
      }
    }
  }, [selectedTripId, currentClaimType, selectedTrip, form])

  const handleReview = async () => {
    const values = form.state.values

    if (values.amount <= 0) {
      const msg = 'Nominal klaim harus lebih besar dari 0'
      form.setFieldMeta('amount', (prev) => ({
        ...prev,
        isTouched: true,
        errorMap: { ...prev?.errorMap, onSubmit: msg },
      }))
      toast.error(msg)
      return
    }

    if (values.claimType === 'Benefit' && values.employeeBenefitId) {
      const selected = empBenefits.find(
        (b) => b.employeeBenefitId === values.employeeBenefitId,
      )
      if (selected && values.amount > selected.balance) {
        const msg = `Saldo plafon benefit tidak mencukupi. Sisa saldo saat ini ${idNumberFormatter.format(selected.balance)}, namun permohonan klaim sebesar ${idNumberFormatter.format(values.amount)}.`
        form.setFieldMeta('amount', (prev) => ({
          ...prev,
          isTouched: true,
          errorMap: { ...prev?.errorMap, onSubmit: msg },
        }))
        toast.error(msg)
        return
      }
    }

    if (
      values.claimType === 'BusinessTripReimbursement' &&
      values.tripProposalId
    ) {
      const selected = approvedTrips.find((t) => t.id === values.tripProposalId)
      if (selected) {
        if (!values.transactionDate) {
          const msg = 'Tanggal invoice wajib diisi.'
          form.setFieldMeta('transactionDate', (prev) => ({
            ...prev,
            isTouched: true,
            errorMap: { ...prev?.errorMap, onSubmit: msg },
          }))
          toast.error(msg)
          return
        }
        if (
          values.transactionDate < selected.startDate ||
          values.transactionDate > selected.endDate
        ) {
          const msg = `Tanggal invoice harus berada di dalam periode perjalanan dinas (${selected.startDate} s/d ${selected.endDate}).`
          form.setFieldMeta('transactionDate', (prev) => ({
            ...prev,
            isTouched: true,
            errorMap: { ...prev?.errorMap, onSubmit: msg },
          }))
          toast.error(msg)
          return
        }
      }

      const maxBudget =
        selected?.myRemainingBudget ??
        selected?.myParticipantAmount ??
        selected?.totalAmount ??
        0
      if (selected && values.amount > maxBudget) {
        const msg = `Nominal klaim (${idNumberFormatter.format(values.amount)}) melebihi sisa alokasi perjalanan dinas Anda (${idNumberFormatter.format(maxBudget)}).`
        form.setFieldMeta('amount', (prev) => ({
          ...prev,
          isTouched: true,
          errorMap: { ...prev?.errorMap, onSubmit: msg },
        }))
        toast.error(msg)
        return
      }
    }

    await form.validateAllFields('submit')
    if (form.state.isValid) setDialogOpen(true)
  }

  const handleConfirm = async () => {
    await form.handleSubmit()
    setDialogOpen(false)
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      {/* Header dengan tombol kembali & badge status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3.5">
          <Link
            to="/claims"
            className="w-10 h-10 rounded-xl bg-card hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs shrink-0"
            title="Kembali ke My Claims"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
                New Claim
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                Formulir Pengajuan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Lengkapi rincian pengeluaran dan lampirkan bukti kuitansi sah untuk diproses reviewer.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card Container */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleReview()
          }}
          className="space-y-7"
        >
          {/* SECTION 1: CLASSIFICATION & ALLOCATION */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <div className="my-2">
                <Label className="mb-2 text-sm font-semibold text-(--sea-ink) block">
                  Claim Type
                </Label>

                <ButtonGroup className="w-full">
                  {claimTypeSelect.map((t) => (
                    <Button
                      key={t.value}
                      type="button"
                      variant={currentClaimType === t.value ? 'default' : 'outline'}
                      className={`grow h-10 cursor-pointer font-semibold transition-all ${
                        currentClaimType === t.value
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-transparent text-foreground hover:bg-muted'
                      }`}
                      onClick={() => handleClaimTypeClick(t.value)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              {currentClaimType === 'Benefit' && (
                <div>
                  <form.AppField name="employeeBenefitId">
                    {(field) => (
                      <field.FormSelect
                        placeholder={
                          benefitGroups.length > 0
                            ? 'Pilih benefit...'
                            : 'Belum ada benefit aktif'
                        }
                        label="Benefit"
                        groups={benefitGroups}
                        onCustomChange={(val) => setSelectedBenefitId(val)}
                      />
                    )}
                  </form.AppField>
                </div>
              )}

              {currentClaimType === 'BusinessTripReimbursement' && (
                <div>
                  <form.AppField name="tripProposalId">
                    {(field) => (
                      <field.FormSelect
                        placeholder={
                          tripSelect.length > 0
                            ? 'Pilih proposal perjalanan...'
                            : 'Tidak ada proposal disetujui'
                        }
                        label="Trip Proposal"
                        values={tripSelect}
                        onCustomChange={(val) => {
                          setSelectedTripId(val)
                          const chosen = approvedTrips.find((t) => t.id === val)
                          if (chosen) {
                            form.setFieldValue('transactionDate', chosen.startDate)
                          }
                        }}
                      />
                    )}
                  </form.AppField>
                </div>
              )}

              {currentClaimType === 'OperationalReimbursement' && (
                <div className="my-2">
                  <label className="mb-2 text-sm font-semibold text-muted-foreground block">
                    Benefit / Allocation
                  </label>
                  <div className="h-10 px-3.5 bg-muted/20 border border-dashed border-border rounded-md flex items-center text-xs text-muted-foreground italic">
                    Penggantian operasional langsung diajukan tanpa penautan benefit atau trip.
                  </div>
                </div>
              )}
            </div>

            {/* BENEFIT / TRIP INFO SUMMARY CARD (BALANCED & INTEGRATED) */}
            {currentClaimType === 'Benefit' && selectedBenefitId && (
              <BenefitInfoBanner
                benefitId={selectedBenefitId}
                empBenefits={empBenefits}
              />
            )}

            {currentClaimType === 'BusinessTripReimbursement' && selectedTripId && (
              <TripInfoBanner
                tripId={selectedTripId}
                trips={approvedTrips}
              />
            )}
          </div>

          <div className="h-px bg-border/70" />

          {/* SECTION 2: TRANSACTION DETAILS */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <form.AppField
                name="transactionDate"
                validators={{
                  onChange: ({ value }) => {
                    if (
                      currentClaimType === 'BusinessTripReimbursement' &&
                      selectedTrip
                    ) {
                      if (!value) return 'Tanggal invoice wajib diisi'
                      if (value < selectedTrip.startDate) {
                        return `Tanggal invoice tidak boleh sebelum tanggal mulai perjalanan (${selectedTrip.startDate}).`
                      }
                      if (value > selectedTrip.endDate) {
                        return `Tanggal invoice tidak boleh setelah tanggal selesai perjalanan (${selectedTrip.endDate}).`
                      }
                    }
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <field.DatePicker
                    label="Invoice Date"
                    minDate={
                      currentClaimType === 'BusinessTripReimbursement'
                        ? selectedTrip?.startDate
                        : undefined
                    }
                    maxDate={
                      currentClaimType === 'BusinessTripReimbursement'
                        ? selectedTrip?.endDate
                        : undefined
                    }
                    helperText={
                      currentClaimType === 'BusinessTripReimbursement' &&
                      selectedTrip
                        ? `Periode perjalanan dinas: ${selectedTrip.startDate} s/d ${selectedTrip.endDate}`
                        : undefined
                    }
                  />
                )}
              </form.AppField>

              <form.AppField
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    if (
                      currentClaimType === 'Benefit' &&
                      form.state.values.employeeBenefitId
                    ) {
                      const selected = empBenefits.find(
                        (b) =>
                          b.employeeBenefitId ===
                          form.state.values.employeeBenefitId,
                      )
                      if (selected && value > selected.balance) {
                        return `Saldo plafon tidak mencukupi (Sisa: ${idNumberFormatter.format(selected.balance)}).`
                      }
                    }
                    if (
                      currentClaimType === 'BusinessTripReimbursement' &&
                      form.state.values.tripProposalId
                    ) {
                      const selected = approvedTrips.find(
                        (t) => t.id === form.state.values.tripProposalId,
                      )
                      const maxBudget =
                        selected?.myRemainingBudget ??
                        selected?.myParticipantAmount ??
                        selected?.totalAmount ??
                        0
                      if (selected && value > maxBudget) {
                        return `Nominal melebihi plafon alokasi perjalanan (${idNumberFormatter.format(maxBudget)}).`
                      }
                    }
                    return undefined
                  },
                  onSubmit: ({ value }) => {
                    if (value <= 0) {
                      return 'Nominal klaim harus lebih besar dari 0'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <field.CurrencyField label="Amount" placeholder="0" />
                )}
              </form.AppField>
            </div>

            <form.AppField name="description">
              {(field) => (
                <field.TextArea
                  label="Description"
                  placeholder="Jelaskan secara ringkas tujuan pengeluaran klaim ini..."
                  rows={4}
                />
              )}
            </form.AppField>
          </div>

          <div className="h-px bg-border/70" />

          {/* SECTION 3: PROOF OF PAYMENT DROPZONE */}
          <form.AppField name="receiptFile">
            {(field) => (
              <field.FileInput label="Receipt File (Proof of Payment)" />
            )}
          </form.AppField>

          {/* FORM FOOTER ACTIONS */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link to="/claims">
              <Button type="button" variant="outline" className="cursor-pointer">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 cursor-pointer gap-2"
              disabled={form.state.isSubmitting}
            >
              <Send className="w-4 h-4" />
              <span>{form.state.isSubmitting ? 'Mengirimkan...' : 'Submit Claim'}</span>
            </Button>
          </div>

          {/* CONFIRMATION DIALOG MODAL */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Konfirmasi Pengajuan Klaim</DialogTitle>
                <DialogDescription className="text-sm pt-1">
                  Pastikan rincian data pengajuan klaim Anda sudah benar sebelum diteruskan ke reviewer.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tipe Klaim:</span>
                  <span className="font-semibold text-foreground">
                    {claimTypeSelect.find((c) => c.value === currentClaimType)?.label || currentClaimType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tanggal Invoice:</span>
                  <span className="font-semibold text-foreground">{form.state.values.transactionDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Nominal Pengajuan:</span>
                  <span className="font-bold text-base text-blue-600 dark:text-blue-400 font-mono">
                    {idNumberFormatter.format(form.state.values.amount)}
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Periksa Kembali
                  </Button>
                </DialogClose>
                <Button
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  {form.state.isSubmitting ? 'Mengirimkan...' : 'Konfirmasi & Kirim'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </main>
  )
}

function BenefitInfoBanner({
  benefitId,
  empBenefits,
}: {
  benefitId: string
  empBenefits: any[]
}) {
  const selectedBenefit = empBenefits.find(
    (b) => b.employeeBenefitId === benefitId,
  )

  if (!selectedBenefit) return null

  return (
    <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-heading">
            {selectedBenefit.benefitName}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            {selectedBenefit.categoryName || 'General'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Periode aktif: <span className="font-medium text-foreground">{selectedBenefit.startDate}</span> s/d{' '}
          <span className="font-medium text-foreground">{selectedBenefit.endDate}</span>
        </p>
      </div>

      <div className="sm:text-right shrink-0 bg-background/80 dark:bg-card px-3.5 py-2 rounded-lg border border-border/80">
        <span className="text-[11px] text-muted-foreground block">
          Sisa Kuota Tersedia
        </span>
        <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
          {idNumberFormatter.format(selectedBenefit.balance)}
        </span>
      </div>
    </div>
  )
}

function TripInfoBanner({ tripId, trips }: { tripId: string; trips: any[] }) {
  const selectedTrip = trips.find((t) => t.id === tripId)
  if (!selectedTrip) return null

  const budget =
    selectedTrip.myRemainingBudget ??
    selectedTrip.myParticipantAmount ??
    selectedTrip.totalAmount

  return (
    <div className="p-4 rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-heading">
            Perjalanan Dinas: {selectedTrip.destination}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
            Trip Proposal
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Jadwal: <span className="font-medium text-foreground">{selectedTrip.startDate}</span> -{' '}
          <span className="font-medium text-foreground">{selectedTrip.endDate}</span>
        </p>
      </div>

      <div className="sm:text-right shrink-0 bg-background/80 dark:bg-card px-3.5 py-2 rounded-lg border border-border/80">
        <span className="text-[11px] text-muted-foreground block">
          Plafon Alokasi Perjalanan
        </span>
        <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
          {idNumberFormatter.format(budget)}
        </span>
      </div>
    </div>
  )
}
