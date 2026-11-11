import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { ButtonGroup } from '#/components/ui/button-group'
import { Label } from '#/components/ui/label'
import { useEffect, useMemo, useState } from 'react'
import { createClaimForm } from '#/features/claims/forms/forms'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { useGetAllTripProposalsQuery } from '#/features/trip-proposals/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { toast } from 'sonner'
import { AlertCircle, ArrowLeft } from 'lucide-react'
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
}

export const Route = createFileRoute('/_app/claims/create')({
  validateSearch: (search: Record<string, unknown>): ClaimCreateSearchParams => ({
    employeeBenefitId:
      typeof search.employeeBenefitId === 'string'
        ? search.employeeBenefitId
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
  const { employeeBenefitId: searchBenefitId } = Route.useSearch()
  const { data: empBenefits = [] } = useGetAllEmployeeBenefitsQuery()
  const { data: tripProposals = [] } = useGetAllTripProposalsQuery()
  const [dialogOpen, setDialogOpen] = useState(false)

  const [currentClaimType, setClaimType] = useState('Benefit')
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
  }

  const approvedTrips = tripProposals.filter((t) => {
    const s = String(t.status).toLowerCase()
    return s === 'approved' || s === 'completed' || s === '4' || s === '6'
  })

  const tripSelect = approvedTrips.map((t) => ({
    label: `${t.destination} (Budget: ${idNumberFormatter.format(t.totalAmount)})`,
    value: t.id,
  }))

  // Kelompokkan Benefit berdasarkan Kategori dengan format groups
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
    if (searchBenefitId) {
      setClaimType('Benefit')
      form.setFieldValue('claimType', 'Benefit')
      form.setFieldValue('employeeBenefitId', searchBenefitId)
    }
  }, [searchBenefitId])

  const handleReview = async () => {
    const values = form.state.values

    if (values.amount <= 0) {
      const msg = 'Amount must be greater than 0'
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
        const msg = `Insufficient benefit quota balance. Current balance is ${idNumberFormatter.format(selected.balance)}, but claim amount requested is ${idNumberFormatter.format(values.amount)}.`
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
      if (selected && values.amount > selected.totalAmount) {
        const msg = `Claim amount (${idNumberFormatter.format(values.amount)}) exceeds remaining trip budget (${idNumberFormatter.format(selected.totalAmount)}).`
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
      {/* Header dengan tombol kembali */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/claims"
            className="w-10 h-10 rounded-xl bg-card hover:bg-muted/60 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
            title="Kembali ke My Claims"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              New Claim
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Ajukan permohonan klaim penggantian biaya benefit, operasional, atau perjalanan dinas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleReview()
          }}
          className="space-y-6"
        >
          {/* Row 1: Claim Type (3 Buttons) & Target (Benefit / Trip / Helper) */}
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
                    <div>
                      <field.FormSelect
                        placeholder={
                          benefitGroups.length > 0
                            ? 'Pick benefit'
                            : 'No active benefits found'
                        }
                        label="Benefit"
                        groups={benefitGroups}
                      />
                      {field.state.value && (
                        <BenefitInfoBanner
                          benefitId={field.state.value}
                          empBenefits={empBenefits}
                        />
                      )}
                    </div>
                  )}
                </form.AppField>
              </div>
            )}

            {currentClaimType === 'BusinessTripReimbursement' && (
              <div>
                <form.AppField name="tripProposalId">
                  {(field) => (
                    <div>
                      <field.FormSelect
                        placeholder={
                          tripSelect.length > 0
                            ? 'Select approved trip proposal'
                            : 'No approved trip proposals found'
                        }
                        label="Trip Proposal"
                        values={tripSelect}
                      />
                      {field.state.value && (
                        <TripInfoBanner
                          tripId={field.state.value}
                          trips={approvedTrips}
                        />
                      )}
                    </div>
                  )}
                </form.AppField>
              </div>
            )}

            {currentClaimType === 'OperationalReimbursement' && (
              <div className="my-2">
                <label className="mb-2 text-sm font-semibold text-muted-foreground block">
                  Benefit / Allocation
                </label>
                <div className="h-10 px-3 bg-muted/20 border border-dashed border-border rounded-md flex items-center text-xs text-muted-foreground italic">
                  Penggantian biaya operasional diajukan langsung tanpa alokasi benefit/trip.
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Transaction Date & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <form.AppField name="transactionDate">
              {(field) => <field.DatePicker label="Invoice Date" />}
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
                      return `Insufficient benefit quota balance. Current balance is ${idNumberFormatter.format(selected.balance)}.`
                    }
                  }
                  if (
                    currentClaimType === 'BusinessTripReimbursement' &&
                    form.state.values.tripProposalId
                  ) {
                    const selected = approvedTrips.find(
                      (t) => t.id === form.state.values.tripProposalId,
                    )
                    if (selected && value > selected.totalAmount) {
                      return `Amount exceeds approved trip budget (${idNumberFormatter.format(selected.totalAmount)}).`
                    }
                  }
                  return undefined
                },
                onSubmit: ({ value }) => {
                  if (value <= 0) {
                    return 'Amount must be greater than 0'
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

          {/* Row 3: Description */}
          <form.AppField name="description">
            {(field) => (
              <field.TextArea
                label="Description"
                placeholder="Explain the purpose of this claim..."
                rows={4}
              />
            )}
          </form.AppField>

          {/* Row 4: Receipt File Dropzone */}
          <form.AppField name="receiptFile">
            {(field) => (
              <field.FileInput label="Receipt File (Proof of Payment)" />
            )}
          </form.AppField>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link to="/claims">
              <Button type="button" variant="outline" className="cursor-pointer">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 cursor-pointer"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? 'Mengirimkan...' : 'Submit Claim'}
            </Button>
          </div>

          {/* Confirmation Modal */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Konfirmasi Pengajuan Klaim</DialogTitle>
                <DialogDescription className="text-sm pt-1">
                  Pastikan rincian data pengajuan klaim Anda sudah benar sebelum diteruskan ke reviewer.
                </DialogDescription>
              </DialogHeader>

              <div className="p-3.5 bg-muted/30 border border-border rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tipe Klaim:</span>
                  <span className="font-semibold text-foreground">
                    {claimTypeSelect.find((c) => c.value === currentClaimType)?.label || currentClaimType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tanggal Transaksi:</span>
                  <span className="font-semibold text-foreground">{form.state.values.transactionDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Nominal Pengajuan:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
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
    <div className="mt-2.5 p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs space-y-1.5 text-foreground">
      <div className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Detail Benefit: {selectedBenefit.benefitName}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100 dark:border-blue-900/40 text-[11px]">
        <div>
          <span className="text-muted-foreground">Kategori: </span>
          <span className="font-medium">{selectedBenefit.categoryName || 'General'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Sisa Plafon: </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {idNumberFormatter.format(selectedBenefit.balance)}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Periode Aktif: </span>
          <span className="font-medium">{selectedBenefit.startDate}</span> s/d{' '}
          <span className="font-medium">{selectedBenefit.endDate}</span>
        </div>
      </div>
    </div>
  )
}

function TripInfoBanner({ tripId, trips }: { tripId: string; trips: any[] }) {
  const selectedTrip = trips.find((t) => t.id === tripId)
  if (!selectedTrip) return null

  const myBudget =
    selectedTrip.myParticipantAmount ?? selectedTrip.totalAmount
  const remainingBudget =
    selectedTrip.myRemainingBudget ?? selectedTrip.myParticipantAmount ?? selectedTrip.totalAmount

  return (
    <div className="mt-2.5 p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs space-y-1.5 text-foreground">
      <div className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-400">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Proposal Trip: {selectedTrip.destination}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100 dark:border-blue-900/40 text-[11px]">
        <div>
          <span className="text-muted-foreground">Budget Anda: </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {idNumberFormatter.format(myBudget)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Sisa Budget Anda: </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {idNumberFormatter.format(remainingBudget)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Total Budget Trip: </span>
          <span className="font-medium">
            {idNumberFormatter.format(selectedTrip.totalAmount)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Jadwal: </span>
          <span className="font-medium">
            {selectedTrip.startDate} - {selectedTrip.endDate}
          </span>
        </div>
      </div>
    </div>
  )
}
