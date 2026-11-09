import { createFileRoute } from '@tanstack/react-router'
import { ButtonGroup } from '#/components/ui/button-group'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { createClaimForm } from '#/features/claims/forms/forms'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { useGetAllTripProposalsQuery } from '#/features/trip-proposals/queries/getAllProposals'
import { idNumberFormatter } from '#/lib/formatter'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/claims/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: empBenefits = [] } = useGetAllEmployeeBenefitsQuery()
  const { data: tripProposals = [] } = useGetAllTripProposalsQuery()

  const [currentClaimType, setClaimType] = useState('Benefit')

  const claimTypeSelect = [
    { label: 'Benefit', value: 'Benefit' },
    { label: 'Operational', value: 'OperationalReimbursement' },
    { label: 'Trip', value: 'BusinessTripReimbursement' },
  ]

  // Filter trip proposal yang sudah disetujui (Approved atau Completed)
  const approvedTrips = tripProposals.filter((t) =>
    ['Approved', 'Completed'].includes(t.status),
  )

  const tripSelect = approvedTrips.map((t) => ({
    label: `${t.destination} (Budget: ${idNumberFormatter.format(t.totalAmount)})`,
    value: t.id,
  }))

  const benefitSelect = empBenefits.map((b) => ({
    label: `${b.benefitName} (Sisa: ${idNumberFormatter.format(b.balance)})`,
    value: b.employeeBenefitId,
  }))

  const form = createClaimForm()

  const handleClaimTypeClick = (value: string) => {
    setClaimType(value)
    form.setFieldValue('claimType', value)
    form.setFieldValue('employeeBenefitId', null)
    form.setFieldValue('tripProposalId', null)
  }

  return (
    <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto border border-border shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <Link to="/claims">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Claims
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">New Claim</h1>
        <div className="w-20" />
      </div>

      <div className="flex justify-center mb-6">
        <ButtonGroup>
          {claimTypeSelect.map((t) => (
            <ClaimTypeButton
              key={t.value}
              label={t.label}
              value={t.value}
              current={currentClaimType}
              setFunc={handleClaimTypeClick}
            />
          ))}
        </ButtonGroup>
      </div>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="transactionDate">
              {(field) => <field.DatePicker label="Transaction Date" />}
            </form.AppField>

            <form.AppField name="amount">
              {(field) => <field.NumberField label="Amount" />}
            </form.AppField>

            {/* Poin 1: Operational TIDAK memunculkan dropdown Benefit atau Trip */}
            {currentClaimType === 'BusinessTripReimbursement' && (
              <div className="col-span-2">
                <form.AppField name="tripProposalId">
                  {(field) => (
                    <field.FormSelect
                      values={tripSelect}
                      placeholder={
                        tripSelect.length > 0
                          ? 'Select approved trip proposal'
                          : 'No approved trip proposals found'
                      }
                      label="Business Trip Proposal"
                    />
                  )}
                </form.AppField>
              </div>
            )}

            {currentClaimType === 'Benefit' && (
              <div className="col-span-2">
                <form.AppField name="employeeBenefitId">
                  {(field) => (
                    <>
                      <field.FormSelect
                        placeholder="Select benefit quota"
                        values={benefitSelect}
                        label="Employee Benefit"
                      />
                      {field.state.value && (
                        <BenefitInfoBanner
                          benefitId={field.state.value}
                          empBenefits={empBenefits}
                        />
                      )}
                    </>
                  )}
                </form.AppField>
              </div>
            )}

            <div className="col-span-2">
              <form.AppField name="receiptFile">
                {(field) => <field.FileInput label="Receipt File (Proof of Payment)" />}
              </form.AppField>
            </div>
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

          <div className="mt-6 flex justify-end">
            <form.AppForm>
              <form.FormButton label="Submit Claim" className="bg-primary" />
            </form.AppForm>
          </div>
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

function ClaimTypeButton({
  label,
  value,
  current,
  setFunc,
}: {
  label: string
  value: string
  current: string
  setFunc: (v: string) => void
}) {
  return (
    <Button
      type="button"
      className={current === value ? 'bg-primary' : 'bg-transparent text-foreground'}
      onClick={() => setFunc(value)}
      variant="outline"
    >
      {label}
    </Button>
  )
}
