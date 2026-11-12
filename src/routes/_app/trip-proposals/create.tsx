import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowLeft, CircleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from 'cn'

import { Button } from '#/components/ui/button'
import { createTripProposalForm } from '#/features/trip-proposals/forms/forms'
import { useGetAllEmployeeQuery } from '#/features/employees/queries/queries'
import { useAuth } from '#/hooks/auth.hook'
import { toDateOnly } from '#/lib/utils'

import type { EmployeeResponse } from '#/types/employee.type'
import type { TripProposalParticipantInput } from '#/types/tripProposals.type'

const MAX_TRIP_AMOUNT = 100000000

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
  const { data: employeesResponse, isLoading } = useGetAllEmployeeQuery()

  const employees = employeesResponse?.data || []

  // if (!user) {
  //   return <p>Loading user information...</p>
  // }

  if (isLoading) {
    return <p>Loading employees...</p>
  }

  const currentEmployee = employees.find(
    (employee) => employee.email.toLowerCase() === user.email.toLowerCase(),
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

  // Menambahkan peserta baru.
  const handleAddParticipant = () => {
    updateParticipants([
      ...participants,
      {
        employeeId: '',
        isPic: false,
        amount: 0,
      },
    ])
  }

  // Mengubah EmployeeId peserta.
  const handleEmployeeChange = (index: number, employeeId: string) => {
    const updatedParticipants = participants.map((participant, i) =>
      i === index ? { ...participant, employeeId } : participant,
    )

    updateParticipants(updatedParticipants)
  }

  // Menghapus peserta tambahan.
  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index)

    updateParticipants(updatedParticipants)
  }

  const isParticipantCountInvalid =
    hasAttemptedSubmit && participants.length < 1

  const hasEmptyParticipant = participants.some(
    (participant) => !participant.employeeId,
  )

  const isParticipantsInvalid =
    hasAttemptedSubmit && (isParticipantCountInvalid || hasEmptyParticipant)

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

    if (values.accommodationAmount > MAX_TRIP_AMOUNT) {
      toast.error('Maximum Accommodation Amount is Rp 100.000.000.')
      return
    }

    // Validasi Accommodation Amount.
    if (!values.accommodationAmount || values.accommodationAmount <= 0) {
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
      {/* Page Header - Outside Form Card */}
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
                Formulir Pengajuan
              </span>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Lengkapi informasi perjalanan dinas dan peserta yang akan
              mengikuti perjalanan.
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

            {/* Destination Full Width */}
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
                  <field.DatePicker label="Start Date" minDate={today} />
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
                />
              )}
            </form.AppField>

            <p className="mt-2 text-xs text-muted-foreground">
              Total biaya akomodasi dan perjalanan untuk seluruh proposal,
              seperti hotel dan tiket. Bukan limit reimbursement per peserta.
            </p>
          </div>

          {/* SECTION 3: DESCRIPTION & DOCUMENT */}
          <div className="space-y-5">
            <form.AppField name="description">
              {(field) => <field.TextArea label="Description" rows={5} />}
            </form.AppField>

            <form.AppField name="file">
              {(field) => (
                <field.FileInput label="Proposal Letter (Required)" />
              )}
            </form.AppField>
          </div>

          <div className="h-px bg-border/70" />

          {/* SECTION 4: PARTICIPANTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2
                  className={cn(
                    'text-lg font-semibold',
                    isParticipantsInvalid && 'text-rose-600 dark:text-rose-400',
                  )}
                >
                  Participants
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  At least one employee is required. The PIC can be the only
                  participant.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddParticipant}
              >
                Add Participant
              </Button>
            </div>

            <div
              className={cn(
                'space-y-4 rounded-lg',
                isParticipantsInvalid &&
                  'border border-rose-500 bg-rose-50/20 p-3 dark:bg-rose-950/20',
              )}
            >
              {participants.map((participant, index) => {
                const availableEmployees = employees.filter(
                  (employee) =>
                    !participants.some(
                      (other, otherIndex) =>
                        otherIndex !== index &&
                        other.employeeId === employee.id,
                    ),
                )

                const isEmployeeInvalid =
                  hasAttemptedSubmit &&
                  !participant.isPic &&
                  !participant.employeeId

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <label
                        className={cn(
                          'mb-2 block text-sm font-semibold transition-colors',
                          isEmployeeInvalid
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-(--sea-ink)',
                        )}
                      >
                        Employee
                      </label>

                      {participant.isPic ? (
                        <div className="rounded-md border border-border bg-muted p-2 text-sm">
                          {currentEmployee.fullName} (PIC)
                        </div>
                      ) : (
                        <>
                          <select
                            aria-invalid={isEmployeeInvalid}
                            className={cn(
                              'h-10 w-full rounded-md border border-border bg-input px-3 text-sm transition-all',
                              isEmployeeInvalid &&
                                'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20',
                            )}
                            value={participant.employeeId}
                            onChange={(event) =>
                              handleEmployeeChange(index, event.target.value)
                            }
                          >
                            <option value="">Select employee</option>

                            {availableEmployees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.fullName} ({employee.number})
                              </option>
                            ))}
                          </select>

                          {isEmployeeInvalid && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                              <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                              <span>Please select an employee.</span>
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {participant.isPic ? (
                        <span className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                          PIC
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleRemoveParticipant(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {isParticipantCountInvalid && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                <span>At least one participant is required.</span>
              </p>
            )}
          </div>

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
