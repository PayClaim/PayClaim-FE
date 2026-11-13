
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
import { ArrowLeft, CircleAlert, Send } from 'lucide-react'
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

const MAX_CLAIM_AMOUNT = 100000000

export const Route = createFileRoute('/_app/claims/create')({
  validateSearch: (
    search: Record<string, unknown>,
  ): ClaimCreateSearchParams => ({
    employeeBenefitId:
      typeof search.employeeBenefitId === 'string'
        ? search.employeeBenefitId
        : undefined,
    tripProposalId:
      typeof search.tripProposalId === 'string'
        ? search.tripProposalId
        : undefined,
    claimType:
      typeof search.claimType === 'string' ? search.claimType : undefined,
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

  const form = createClaimForm(searchBenefitId)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [currentClaimType, setClaimType] = useState('Benefit')

  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(
    searchBenefitId ?? null,
  )

  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    searchTripId ?? null,
  )

  const [isAmountLimitExceeded, setIsAmountLimitExceeded] =
    useState(false)

  const claimTypeSelect = [
    { label: 'Benefit', value: 'Benefit' },
    { label: 'Operational', value: 'OperationalReimbursement' },
    { label: 'Trip', value: 'BusinessTripReimbursement' },
  ]

  // Menghapus peringatan dan error Amount sebelumnya.
  const resetAmountValidation = () => {
    setIsAmountLimitExceeded(false)

    form.setFieldMeta('amount', (prev) => ({
      ...prev,
      isTouched: false,
      errorMap: {
        ...prev.errorMap,
        onChange: undefined,
        onSubmit: undefined,
      },
    }))
  }

  const handleClaimTypeClick = (value: string) => {
    setClaimType(value)

    form.setFieldValue('claimType', value)
    form.setFieldValue('employeeBenefitId', null)
    form.setFieldValue('tripProposalId', null)

    setSelectedBenefitId(null)
    setSelectedTripId(null)

    resetAmountValidation()

    if (value !== 'BusinessTripReimbursement') {
      form.setFieldValue('transactionDate', toDateOnly(new Date()))
    }
  }

  // Hanya gunakan sisa plafon reimbursement milik karyawan.
  // totalAmount tidak digunakan karena merupakan anggaran akomodasi Trip.
  const approvedTrips = tripProposals.filter((trip) => {
    const status = String(trip.status).toLowerCase()

    const isApproved =
      status === 'approved' ||
      status === 'completed' ||
      status === '4' ||
      status === '6'

    const remainingBudget = getTripRemainingBudget(trip)

    return isApproved && remainingBudget > 0
  })

  const tripSelect = approvedTrips.map((trip) => ({
    label: `${trip.destination} (Limit: ${idNumberFormatter.format(
      getTripRemainingBudget(trip),
    )})`,
    value: trip.id,
  }))

  // Kelompokkan Benefit berdasarkan kategori.
  const benefitGroups: SelectOptionGroup[] = useMemo(() => {
    const groupMap = new Map<
      string,
      Array<{ label: string; value: string }>
    >()

    empBenefits.forEach((benefit) => {
      const category =
        benefit.categoryName.trim() || 'General Benefits'

      if (!groupMap.has(category)) {
        groupMap.set(category, [])
      }

      groupMap.get(category)!.push({
        label: `${benefit.benefitName} (Remaining: ${idNumberFormatter.format(
          benefit.balance,
        )})`,
        value: benefit.employeeBenefitId,
      })
    })

    return Array.from(groupMap.entries()).map(([groupLabel, items]) => ({
      groupLabel,
      items,
    }))
  }, [empBenefits])

  // Mengisi pilihan awal dari URL.
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

  // Gunakan ID pilihan terbaru sebagai sumber utama.
  const selectedBenefit = empBenefits.find(
    (benefit) => benefit.employeeBenefitId === selectedBenefitId,
  )

  const selectedTrip = approvedTrips.find(
    (trip) => trip.id === selectedTripId,
  )

  // Sisa saldo Benefit yang dipilih.
  const selectedBenefitBudget = selectedBenefit
    ? getNonNegativeAmount(selectedBenefit.balance)
    : undefined

  // Sisa reimbursement Trip milik karyawan yang login.
  const selectedTripBudget = selectedTrip
    ? getTripRemainingBudget(selectedTrip)
    : undefined

  // Batas nominal mengikuti plafon yang dipilih,
  // tetapi tidak pernah melebihi Rp100 juta.
  const claimAmountLimit =
    currentClaimType === 'Benefit' &&
    selectedBenefitBudget !== undefined
      ? Math.min(MAX_CLAIM_AMOUNT, selectedBenefitBudget)
      : currentClaimType === 'BusinessTripReimbursement' &&
          selectedTripBudget !== undefined
        ? Math.min(MAX_CLAIM_AMOUNT, selectedTripBudget)
        : MAX_CLAIM_AMOUNT

  // Pesan mengikuti batas yang sedang berlaku.
  const claimAmountLimitMessage =
    currentClaimType === 'Benefit' &&
    selectedBenefitBudget !== undefined &&
    selectedBenefitBudget <= MAX_CLAIM_AMOUNT
      ? `Maximum claim for this benefit is ${idNumberFormatter.format(
          selectedBenefitBudget,
        )}.`
      : currentClaimType === 'BusinessTripReimbursement' &&
          selectedTripBudget !== undefined &&
          selectedTripBudget <= MAX_CLAIM_AMOUNT
        ? `Maximum claim for this trip is ${idNumberFormatter.format(
            selectedTripBudget,
          )}.`
        : `Maximum claim amount is ${idNumberFormatter.format(
            MAX_CLAIM_AMOUNT,
          )}.`

  // Menyesuaikan tanggal invoice dengan periode perjalanan.
  useEffect(() => {
    if (
      currentClaimType === 'BusinessTripReimbursement' &&
      selectedTrip
    ) {
      const currentDate = form.state.values.transactionDate

      if (
        !currentDate ||
        currentDate < selectedTrip.startDate ||
        currentDate > selectedTrip.endDate
      ) {
        form.setFieldValue(
          'transactionDate',
          selectedTrip.startDate,
        )
      }
    }
  }, [selectedTripId, currentClaimType, selectedTrip, form])

  const handleReview = async () => {
    const values = form.state.values

    // Validasi nominal dengan plafon yang sedang dipilih.
    if (
      !Number.isFinite(values.amount) ||
      values.amount > claimAmountLimit
    ) {
      const message = claimAmountLimitMessage

      setIsAmountLimitExceeded(true)

      form.setFieldMeta('amount', (prev) => ({
        ...prev,
        isTouched: true,
        errorMap: {
          ...prev.errorMap,
          onSubmit: message,
        },
      }))

      toast.error(message)
      return
    }

    setIsAmountLimitExceeded(false)

    if (values.amount <= 0) {
      const message = 'Claim amount must be greater than 0'

      form.setFieldMeta('amount', (prev) => ({
        ...prev,
        isTouched: true,
        errorMap: {
          ...prev.errorMap,
          onSubmit: message,
        },
      }))

      toast.error(message)
      return
    }

    // Validasi tanggal invoice untuk Business Trip.
    if (
      values.claimType === 'BusinessTripReimbursement' &&
      values.tripProposalId &&
      selectedTrip
    ) {
      if (!values.transactionDate) {
        const message = 'Invoice date is required.'

        form.setFieldMeta('transactionDate', (prev) => ({
          ...prev,
          isTouched: true,
          errorMap: {
            ...prev?.errorMap,
            onSubmit: message,
          },
        }))

        toast.error(message)
        return
      }

      if (
        values.transactionDate < selectedTrip.startDate ||
        values.transactionDate > selectedTrip.endDate
      ) {
        const message = `Invoice date must be within the business trip period (${selectedTrip.startDate} to ${selectedTrip.endDate}).`

        form.setFieldMeta('transactionDate', (prev) => ({
          ...prev,
          isTouched: true,
          errorMap: {
            ...prev?.errorMap,
            onSubmit: message,
          },
        }))

        toast.error(message)
        return
      }
    }

    await form.validateAllFields('submit')

    if (form.state.isValid) {
      setDialogOpen(true)
    }
  }

  const handleConfirm = async () => {
    await form.handleSubmit()
    setDialogOpen(false)
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3.5">
          <Link
            to="/claims"
            className="w-10 h-10 rounded-xl bg-card hover:bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs shrink-0"
            title="Back to My Claims"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
                New Claim
              </h1>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                Submission Form
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Complete the expense details and attach a valid receipt
              for reviewer processing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
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
                  {claimTypeSelect.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={
                        currentClaimType === type.value
                          ? 'default'
                          : 'outline'
                      }
                      className={`grow h-10 cursor-pointer font-semibold transition-all ${
                        currentClaimType === type.value
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-transparent text-foreground hover:bg-muted'
                      }`}
                      onClick={() => handleClaimTypeClick(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              {currentClaimType === 'Benefit' && (
                <div className="min-w-0 w-full">
                  <form.AppField name="employeeBenefitId">
                    {(field) => (
                      <field.FormSelect
                        placeholder={
                          benefitGroups.length > 0
                            ? 'Select benefit...'
                            : 'No active benefits available'
                        }
                        label="Benefit"
                        groups={benefitGroups}
                        onCustomChange={(value) => {
                          setSelectedBenefitId(value)
                          form.setFieldValue('employeeBenefitId', value)
                          resetAmountValidation()
                        }}
                      />
                    )}
                  </form.AppField>
                </div>
              )}

              {currentClaimType === 'BusinessTripReimbursement' && (
                <div className="min-w-0 w-full">
                  <form.AppField name="tripProposalId">
                    {(field) => (
                      <field.FormSelect
                        placeholder={
                          tripSelect.length > 0
                            ? 'Select trip proposal...'
                            : 'No approved proposals available'
                        }
                        label="Trip Proposal"
                        values={tripSelect}
                        onCustomChange={(value) => {
                          setSelectedTripId(value)
                          form.setFieldValue('tripProposalId', value)

                          resetAmountValidation()

                          const chosen = approvedTrips.find(
                            (trip) => trip.id === value,
                          )

                          if (chosen) {
                            form.setFieldValue(
                              'transactionDate',
                              chosen.startDate,
                            )
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

                  <div className="h-10 px-3.5 bg-muted/20 border border-dashed border-border rounded-md flex items-center text-xs text-muted-foreground">
                    Operational reimbursement is submitted directly without linking
                    a benefit or trip.
                  </div>
                </div>
              )}
            </div>

            {/* Benefit Info */}
            {currentClaimType === 'Benefit' && selectedBenefitId && (
              <BenefitInfoBanner
                benefitId={selectedBenefitId}
                empBenefits={empBenefits}
              />
            )}

            {/* Trip Info */}
            {currentClaimType === 'BusinessTripReimbursement' &&
              selectedTripId && (
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
              {/* Invoice Date */}
              <div
                className="
                  min-w-0 w-full
                  [&_label]:mb-2
                  [&_label]:block
                  [&_label]:leading-5
                  [&_button]:h-10
                  [&_button]:w-full
                "
              >
                <form.AppField
                  name="transactionDate"
                  validators={{
                    onChange: ({ value }) => {
                      if (
                        currentClaimType === 'BusinessTripReimbursement' &&
                        selectedTrip
                      ) {
                        if (!value) {
                          return 'Invoice date is required'
                        }

                        if (value < selectedTrip.startDate) {
                          return `Invoice date cannot be earlier than the trip start date (${selectedTrip.startDate}).`
                        }

                        if (value > selectedTrip.endDate) {
                          return `Invoice date cannot be later than the trip end date (${selectedTrip.endDate}).`
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
                          ? `Business trip period: ${selectedTrip.startDate} to ${selectedTrip.endDate}`
                          : undefined
                      }
                    />
                  )}
                </form.AppField>
              </div>

              {/* Amount */}
              <div className="min-w-0 w-full pt-4"> 
                <form.AppField
                  name="amount"
                  validators={{
                    onChange: ({ value }) => {
                      if (value > claimAmountLimit) {
                        return claimAmountLimitMessage
                      }

                      return undefined
                    },

                    onSubmit: ({ value }) => {
                      if (value <= 0) {
                        return 'Claim amount must be greater than 0'
                      }

                      if (value > claimAmountLimit) {
                        return claimAmountLimitMessage
                      }

                      return undefined
                    },
                  }}
                >
                  {(field) => {
                    const currentAmount = Number(field.state.value) || 0

                    const isCurrentAmountOverLimit =
                      currentAmount > claimAmountLimit

                    const showAmountLimitWarning =
                      isAmountLimitExceeded || isCurrentAmountOverLimit

                    return (
                      <div className="w-full space-y-2">
                        <Label
                          htmlFor="claim-amount"
                          className="mb-2 block text-sm font-semibold leading-5 text-(--sea-ink)"
                        >
                          Amount
                        </Label>

                        <div className="relative w-full">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                            Rp
                          </span>

                          <input
                            id="claim-amount"
                            type="text"
                            inputMode="numeric"
                            value={
                              currentAmount > 0
                                ? formatAmountInput(currentAmount)
                                : ''
                            }
                            placeholder="0"
                            onChange={(event) => {
                              const digits = event.target.value.replace(
                                /\D/g,
                                '',
                              )

                              const numericAmount = digits
                                ? Number(digits)
                                : 0

                              // Tolak nominal yang melewati plafon.
                              // Tetap izinkan pengurangan nominal lama
                              // jika plafon baru lebih kecil.
                              if (numericAmount > claimAmountLimit) {
                                setIsAmountLimitExceeded(true)

                                if (numericAmount < currentAmount) {
                                  field.handleChange(numericAmount)
                                }

                                return
                              }

                              setIsAmountLimitExceeded(false)
                              field.handleChange(numericAmount)
                            }}
                            onFocus={() => {
                              if (Number(field.state.value) === 0) {
                                field.handleChange(0)
                              }
                            }}
                            onBlur={field.handleBlur}
                            className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm transition-all focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                              showAmountLimitWarning
                                ? 'border-destructive'
                                : 'border-border'
                            }`}
                          />
                        </div>

                        {/* Peringatan batas nominal */}
                        {showAmountLimitWarning && (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                            {claimAmountLimitMessage}
                          </p>
                        )}

                        {/* Error validasi lainnya */}
                        {!showAmountLimitWarning &&
                          field.state.meta.errors.length > 0 && (
                            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                              {String(field.state.meta.errors[0])}
                            </p>
                          )}
                      </div>
                    )
                  }}
                </form.AppField>
              </div>
            </div>

            {/* Description */}
            <form.AppField name="description">
              {(field) => (
                <field.TextArea
                  label="Description"
                  placeholder="Briefly describe the purpose of this expense claim..."
                  rows={4}
                />
              )}
            </form.AppField>
          </div>

          <div className="h-px bg-border/70" />

          {/* SECTION 3: PROOF OF PAYMENT */}
          <form.AppField name="receiptFile">
            {(field) => (
              <field.FileInput label="Receipt File (Proof of Payment)" />
            )}
          </form.AppField>

          {/* FORM FOOTER ACTIONS */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link to="/claims">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 cursor-pointer gap-2"
              disabled={form.state.isSubmitting}
            >
              <Send className="w-4 h-4" />

              <span>
                {form.state.isSubmitting
                  ? 'Submitting...'
                  : 'Submit Claim'}
              </span>
            </Button>
          </div>

          {/* CONFIRMATION DIALOG */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Claim Submission</DialogTitle>

                <DialogDescription className="text-sm pt-1">
                  Please verify that your claim details are accurate before
                  forwarding to the reviewer.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Claim Type:
                  </span>

                  <span className="font-semibold text-foreground">
                    {claimTypeSelect.find(
                      (type) => type.value === currentClaimType,
                    )?.label || currentClaimType}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Invoice Date:
                  </span>

                  <span className="font-semibold text-foreground">
                    {form.state.values.transactionDate}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Submitted Amount:
                  </span>

                  <span className="font-bold text-base text-blue-600 dark:text-blue-400 tabular-nums">
                    {idNumberFormatter.format(form.state.values.amount)}
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Review Again
                  </Button>
                </DialogClose>

                <Button
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  {form.state.isSubmitting
                    ? 'Submitting...'
                    : 'Confirm & Submit'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </main>
  )
}

// Mengambil sisa plafon reimbursement karyawan.
// Tidak menggunakan totalAmount karena itu anggaran akomodasi Trip.
function getTripRemainingBudget(trip: {
  myRemainingBudget?: number | null
  myParticipantAmount?: number | null
}) {
  const amount = Number(
    trip.myRemainingBudget ??
      trip.myParticipantAmount ??
      0,
  )

  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

// Memastikan nominal tidak negatif dan berupa angka valid.
function getNonNegativeAmount(
  value: number | string | null | undefined,
) {
  const amount = Number(value ?? 0)

  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

// Formatter angka untuk input.
// Prefix Rp sudah ditampilkan terpisah di input.
function formatAmountInput(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function BenefitInfoBanner({
  benefitId,
  empBenefits,
}: {
  benefitId: string
  empBenefits: any[]
}) {
  const selectedBenefit = empBenefits.find(
    (benefit) => benefit.employeeBenefitId === benefitId,
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
          Active period:{' '}
          <span className="font-medium text-foreground">
            {selectedBenefit.startDate}
          </span>{' '}
          to{' '}
          <span className="font-medium text-foreground">
            {selectedBenefit.endDate}
          </span>
        </p>
      </div>

      <div className="sm:text-right shrink-0 bg-background/80 dark:bg-card px-3.5 py-2 rounded-lg border border-border/80">
        <span className="text-[11px] text-muted-foreground block">
          Remaining Quota Available
        </span>

        <span className="text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
          {idNumberFormatter.format(selectedBenefit.balance)}
        </span>
      </div>
    </div>
  )
}

function TripInfoBanner({
  tripId,
  trips,
}: {
  tripId: string
  trips: any[]
}) {
  const selectedTrip = trips.find((trip) => trip.id === tripId)

  if (!selectedTrip) return null

  const budget = getTripRemainingBudget(selectedTrip)

  return (
    <div className="p-4 rounded-xl border border-sky-200/80 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-heading">
            Business Trip: {selectedTrip.destination}
          </span>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
            Trip Proposal
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground mt-0.5">
          Schedule:{' '}
          <span className="font-medium text-foreground">
            {selectedTrip.startDate}
          </span>{' '}
          -{' '}
          <span className="font-medium text-foreground">
            {selectedTrip.endDate}
          </span>
        </p>
      </div>

      <div className="sm:text-right shrink-0 bg-background/80 dark:bg-card px-3.5 py-2 rounded-lg border border-border/80">
        <span className="text-[11px] text-muted-foreground block">
          Remaining Reimbursement Limit
        </span>

        <span className="text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
          {idNumberFormatter.format(budget)}
        </span>
      </div>
    </div>
  )
}
