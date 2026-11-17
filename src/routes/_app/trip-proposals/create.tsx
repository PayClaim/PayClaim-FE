
import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { createTripProposalForm } from '#/features/trip-proposals/forms/forms'
import { TripProposalParticipants } from '#/components/pages/tripProposals/TripProposalParticipants'
import { useGetAllEmployeesQuery } from '#/features/employees/queries/queries'
import { useAuth } from '#/hooks/auth.hook'

import { toDateOnly } from '#/lib/utils'

import {
  MAX_TRIP_AMOUNT,
} from '#/features/trip-proposals/utils/tripProposalDetailUtils'

import type { EmployeeResponse } from '#/types/employee.type'
import type { TripProposalParticipantInput } from '#/types/tripProposals.type'

export const Route = createFileRoute('/_app/trip-proposals/create')({
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
  const { user } = useAuth()
  const { data: employees = [], isLoading } = useGetAllEmployeesQuery()

  if (!user || isLoading) {
    return <p>Loading employees...</p>
  }

  const currentEmployee = employees.find(
    (employee) =>
      employee.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (!currentEmployee) {
    return (
      <p className="text-center text-destructive">
        Employee data could not be found for the logged-in user.
      </p>
    )
  }

  return (
    <CreateTripProposalPage
      currentEmployee={currentEmployee}
      employees={employees}
    />
  )
}

function CreateTripProposalPage({
  currentEmployee,
  employees,
}: {
  currentEmployee: EmployeeResponse
  employees: EmployeeResponse[]
}) {
  const form = createTripProposalForm(currentEmployee.id)

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const [participants, setParticipants] = useState<
    TripProposalParticipantInput[]
  >([
    {
      employeeId: currentEmployee.id,
      isPic: true,
      amount: 0,
    },
  ])

  // Tanggal hari ini dalam format YYYY-MM-DD.
  const today = toDateOnly(new Date())

  // Setiap perubahan peserta juga memperbarui nilai form.
  const updateParticipants = (
    newParticipants: TripProposalParticipantInput[],
  ) => {
    setParticipants(newParticipants)
    form.setFieldValue('participants', newParticipants)
  }

  const hasEmptyParticipant = participants.some(
    (participant) => !participant.employeeId,
  )

  // Validasi sebelum form benar-benar dikirim.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setHasAttemptedSubmit(true)

    await form.validateAllFields('submit')

    const values = form.state.values

    // Validasi tanggal perjalanan.
    if (values.startDate && values.startDate < today) {
      toast.error('Start Date cannot be earlier than today.')
      return
    }

    if (values.endDate && values.endDate < today) {
      toast.error('End Date cannot be earlier than today.')
      return
    }

    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      toast.error('End Date cannot be earlier than Start Date.')
      return
    }

    // Validasi Accommodation Amount.
    if (values.accommodationAmount > MAX_TRIP_AMOUNT) {
      toast.error('Maximum Accommodation Amount is Rp 100.000.000.')
      return
    }

    if (
      !values.accommodationAmount ||
      values.accommodationAmount <= 0
    ) {
      toast.error('Accommodation amount must be greater than 0.')
      return
    }

    // Validasi jumlah peserta.
    if (participants.length < 1) {
      toast.error('At least one participant is required.')
      return
    }

    // Validasi Employee setiap peserta.
    if (hasEmptyParticipant) {
      toast.error('Please select an employee for every participant.')
      return
    }

    if (!form.state.isValid) {
      toast.error('Please check the highlighted fields.')
      return
    }

    await form.handleSubmit()
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 pb-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <Link
            to="/trip-proposals"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground"
            title="Back to My Trip Proposals"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                New Trip Proposal
              </h1>

              <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
                Submission Form
              </span>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Complete the business trip details and participants joining
              the trip.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* SECTION 1: TRIP INFORMATION */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-heading">
              Trip Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <form.AppField name="destination">
                  {(field) => (
                    <field.TextField
                      label="Destination"
                      placeholder="Enter destination"
                    />
                  )}
                </form.AppField>
              </div>

              {/* Start Date */}
              <form.AppField
                name="startDate"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value < today) {
                      return 'Start Date cannot be earlier than today.'
                    }

                    const endDate = form.state.values.endDate

                    if (value && endDate && value > endDate) {
                      return 'Start Date cannot be after End Date.'
                    }

                    return undefined
                  },
                }}
              >
                {(field) => (
                  <field.DatePicker
                    label="Start Date"
                    minDate={today}
                  />
                )}
              </form.AppField>

              {/* End Date */}
              <form.AppField
                name="endDate"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value < today) {
                      return 'End Date cannot be earlier than today.'
                    }

                    const startDate = form.state.values.startDate

                    if (value && startDate && value < startDate) {
                      return 'End Date cannot be before Start Date.'
                    }

                    return undefined
                  },
                }}
              >
                {(field) => (
                  <field.DatePicker
                    label="End Date"
                    minDate={form.state.values.startDate || today}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          {/* SECTION 2: ACCOMMODATION AMOUNT */}
          <div>
            <form.AppField
              name="accommodationAmount"
              validators={{
                onChange: ({ value }) => {
                  if (value > MAX_TRIP_AMOUNT) {
                    return 'Maximum Accommodation Amount is Rp 100.000.000.'
                  }

                  return undefined
                },
              }}
            >
              {(field) => (
                <field.CurrencyField
                  label="Accommodation Amount (Hotel, Ticket)"
                  placeholder="0"
                  max={MAX_TRIP_AMOUNT}
                />
              )}
            </form.AppField>

            <p className="mt-2 text-xs text-muted-foreground">
              Total accommodation and travel cost for the entire proposal,
              such as hotel and tickets. Not a per-participant reimbursement limit.
            </p>
          </div>

          {/* SECTION 3: DESCRIPTION & DOCUMENT */}
          <div className="space-y-5">
            <form.AppField name="description">
              {(field) => (
                <field.TextArea
                  label="Description"
                  rows={5}
                />
              )}
            </form.AppField>

            <form.AppField name="file">
              {(field) => (
                <field.FileInput label="Proposal Letter (Required)" />
              )}
            </form.AppField>
          </div>

          <div className="h-px bg-border/70" />

          {/* SECTION 4: PARTICIPANTS */}
          <TripProposalParticipants
            currentEmployee={currentEmployee}
            employees={employees}
            participants={participants}
            hasAttemptedSubmit={hasAttemptedSubmit}
            onChange={updateParticipants}
          />

          {/* SECTION 5: SUBMIT */}
          <div className="border-t border-border pt-6">
            <form.AppForm>
              <form.FormButton label="Submit Proposal" />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}
