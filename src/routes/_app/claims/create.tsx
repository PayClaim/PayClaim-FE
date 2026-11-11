import { createFileRoute, redirect } from '@tanstack/react-router'
import { ButtonGroup } from '#/components/ui/button-group'
import { Button } from '#/components/ui/button'
import { useEffect, useState } from 'react'
import { createClaimForm } from '#/features/claims/forms/forms'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { useGetAllTripProposalsQuery } from '#/features/trip-proposals/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Label } from '#/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '#/components/ui/dialog'

interface ClaimCreateSearchParams {
  employeeBenefitId?: string
}

export const Route = createFileRoute('/_app/claims/create')({
  validateSearch: (
    search: Record<string, unknown>,
  ): ClaimCreateSearchParams => ({
    employeeBenefitId:
      typeof search.employeeBenefitId === 'string'
        ? search.employeeBenefitId
        : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.isAdmin) {
      throw redirect({
        to: '/claims',
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

  const approvedTrips = tripProposals.filter((t) => {
    const s = String(t.status).toLowerCase()
    return s === 'approved' || s === 'completed' || s === '4' || s === '6'
  })

  const tripSelect = approvedTrips.map((t) => ({
    label: `${t.destination} (Budget: ${idNumberFormatter.format(t.totalAmount)})`,
    value: t.id,
  }))

  const benefitSelect = empBenefits.map((b) => ({
    label: `${b.benefitName} (Sisa: ${idNumberFormatter.format(b.balance)})`,
    value: b.employeeBenefitId,
  }))

  const form = createClaimForm(searchBenefitId)

  useEffect(() => {
    if (searchBenefitId) {
      setClaimType('Benefit')
      form.setFieldValue('claimType', 'Benefit')
      form.setFieldValue('employeeBenefitId', searchBenefitId)
    }
  }, [searchBenefitId])

  const handleClaimTypeClick = (value: string) => {
    setClaimType(value)
    form.setFieldValue('claimType', value)
    form.setFieldValue('employeeBenefitId', null)
    form.setFieldValue('tripProposalId', null)
  }

  const handleReview = async () => {
    const values = form.state.values

    if (values.amount <= 0) {
      const msg = 'Amount must be greater than 0'
      form.setFieldMeta('amount', (prev) => ({
        ...prev,
        isTouched: true,
        errorMap: { ...prev.errorMap, onSubmit: msg },
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
          errorMap: { ...prev.errorMap, onSubmit: msg },
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
          errorMap: { ...prev.errorMap, onSubmit: msg },
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
    <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto border border-border shadow-xs">
      <h1 className="text-3xl font-bold text-center mb-8">New Claim</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleReview()
          }}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <form.AppField name="transactionDate">
              {(field) => <field.DatePicker label="Transaction Date" />}
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

            <div className="my-2">
              <Label className="mb-2 text-sm font-semibold text-(--sea-ink)">
                Claim Type
              </Label>

              <ButtonGroup className="w-full">
                {claimTypeSelect.map((t) => (
                  <ClaimTypeButton
                    className="grow"
                    key={t.value}
                    label={t.label}
                    value={t.value}
                    current={currentClaimType}
                    setFunc={handleClaimTypeClick}
                  />
                ))}
              </ButtonGroup>
            </div>

            <div className="">
              <form.AppField name="receiptFile">
                {(field) => (
                  <field.FileInput label="Receipt File (Proof of Payment)" />
                )}
              </form.AppField>
            </div>

            {currentClaimType === 'BusinessTripReimbursement' && (
              <div className="col-span-2 my-2">
                <form.AppField name="tripProposalId">
                  {(field) => (
                    <div>
                      <field.FormSelect
                        values={tripSelect}
                        placeholder={
                          tripSelect.length > 0
                            ? 'Select approved trip proposal'
                            : 'No approved trip proposals found'
                        }
                        label="Trip Proposal"
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

            {currentClaimType === 'Benefit' && (
              <div className="col-span-2 my-2">
                <form.AppField name="employeeBenefitId">
                  {(field) => (
                    <div>
                      <field.FormSelect
                        placeholder="Pick benefit"
                        values={benefitSelect}
                        label="Benefit"
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
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.TextArea
                label="Description"
                placeholder="Explain the purpose of this claim..."
                rows={5}
              />
            )}
          </form.AppField>

          <Button type="submit">Submit</Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>Submit this claim?</DialogHeader>
              <DialogDescription>Form will be submitted</DialogDescription>
              <DialogFooter>
                <DialogClose>Close</DialogClose>
                <Button
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* <div className="mt-6 flex justify-end">
            <form.AppForm>
              <form.FormButton label="Submit Claim" className="bg-primary" />
            </form.AppForm>
          </div> */}
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
    <div className="mt-2 p-3 bg-muted/40 border border-border rounded-xl text-xs space-y-1">
      <div className="flex items-center gap-1.5 font-semibold text-primary">
        <AlertCircle className="h-4 w-4" />
        <span>Benefit Information:</span>
      </div>
      <p>
        Active Period:{' '}
        <span className="font-semibold">{selectedBenefit.startDate}</span> to{' '}
        <span className="font-semibold">{selectedBenefit.endDate}</span>
      </p>
      <p>
        Remaining Quota:{' '}
        <span className="font-semibold text-primary">
          {idNumberFormatter.format(selectedBenefit.balance)}
        </span>
      </p>
    </div>
  )
}

function TripInfoBanner({ tripId, trips }: { tripId: string; trips: any[] }) {
  const selectedTrip = trips.find((t) => t.id === tripId)
  if (!selectedTrip) return null

  return (
    <div className="mt-2 p-3 bg-muted/40 border border-border rounded-xl text-xs space-y-1">
      <div className="flex items-center gap-1.5 font-semibold text-primary">
        <AlertCircle className="h-4 w-4" />
        <span>Trip Proposal Information:</span>
      </div>
      <p>
        Destination:{' '}
        <span className="font-semibold">{selectedTrip.destination}</span>
      </p>
      <p>
        Dates: <span className="font-semibold">{selectedTrip.startDate}</span>{' '}
        to <span className="font-semibold">{selectedTrip.endDate}</span>
      </p>
      <p>
        Approved Budget:{' '}
        <span className="font-semibold text-primary">
          {idNumberFormatter.format(selectedTrip.totalAmount)}
        </span>
      </p>
    </div>
  )
}

function ClaimTypeButton({
  label,
  value,
  current,
  setFunc,
  className,
}: {
  label: string
  value: string
  current: string
  setFunc: (a: string) => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant={current === value ? 'default' : 'outline'}
      className={
        (current === value
          ? 'bg-primary '
          : 'bg-transparent text-foreground ') + className
      }
      onClick={() => setFunc(value)}
    >
      {label}
    </Button>
  )
}
