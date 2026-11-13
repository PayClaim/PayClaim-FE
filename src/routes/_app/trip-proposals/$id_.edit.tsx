import { useState } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CircleAlert,
  Download,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from 'cn'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { ErrorComponent, LoadingComponent } from '#/components/ErrorAndLoading'
import { editTripProposalForm } from '#/features/trip-proposals/forms/forms'
import { useGetProposalByIdQuery } from '#/features/trip-proposals/queries/queries'
import { useGetAllEmployeesQuery } from '#/features/employees/queries/queries'
import { buildEmployeeGroups } from '#/features/employees/utils/employee-options'
import { useAuth } from '#/hooks/auth.hook'
import { downloadFile } from '#/lib/download'
import {
  TripProposalStatus,
  isTripStatus,
  type TripProposalDetailResponse,
  type TripProposalParticipantInput,
} from '#/types/tripProposals.type'
import type { EmployeeResponse } from '#/types/employee.type'

const MAX_TRIP_AMOUNT = 100000000

export const Route = createFileRoute('/_app/trip-proposals/$id_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const {
    data: proposal,
    isError,
    error,
    isLoading,
  } = useGetProposalByIdQuery(id)
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useGetAllEmployeesQuery()

  if (isError) {
    return <ErrorComponent pageTitle="Revise Trip Proposal" error={error} />
  }

  if (isLoading || !proposal || !user || isLoadingEmployees) {
    return <LoadingComponent pageTitle="Revise Trip Proposal" />
  }

  const currentEmployee = employees.find(
    (employee) => employee.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (!currentEmployee) {
    return (
      <main className="mx-auto max-w-4xl py-10">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          Employee data for the currently signed-in account was not found.
        </div>
      </main>
    )
  }

  const isPic = Boolean(
    proposal.participants?.some(
      (p) =>
        p.isPic &&
        String(p.employeeId).toLowerCase() ===
          String(currentEmployee.id).toLowerCase(),
    ),
  )

  const isNeedsRevision = isTripStatus(
    proposal.status,
    TripProposalStatus.NeedsRevision,
  )

  if (!isPic || !isNeedsRevision) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 py-8">
        <Link to="/trip-proposals/$id" params={{ id }}>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Proposal Details</span>
          </Button>
        </Link>
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {!isPic
            ? 'Only the proposal PIC can revise this submission.'
            : 'This proposal is not in Needs Revision status and cannot be modified.'}
        </div>
      </main>
    )
  }

  return (
    <EditTripProposalFormContent
      proposalId={id}
      proposal={proposal}
      currentEmployee={currentEmployee}
      employees={employees}
    />
  )
}

function EditTripProposalFormContent({
  proposalId,
  proposal,
  currentEmployee,
  employees,
}: {
  proposalId: string
  proposal: TripProposalDetailResponse
  currentEmployee: EmployeeResponse
  employees: EmployeeResponse[]
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Pastikan PIC berada di urutan pertama.
  const sortedInitialParticipants: TripProposalParticipantInput[] = [
    ...(proposal.participants || []),
  ]
    .sort((a, b) => Number(b.isPic) - Number(a.isPic))
    .map((p) => ({
      employeeId: p.employeeId,
      isPic: p.isPic,
      amount: p.amount ?? 0,   // pertahankan limit yang ada
    }))

  const initialAccommodationAmount =
    proposal.accommodationAmount > 0
      ? proposal.accommodationAmount
      : proposal.totalAmount || 0

  const initialValues = {
    destination: proposal.destination ?? '',
    startDate: proposal.startDate?.slice(0, 10) || '',
    endDate: proposal.endDate?.slice(0, 10) || '',
    accommodationAmount: initialAccommodationAmount,
    description: proposal.description ?? '',
    participants:
      sortedInitialParticipants.length > 0
        ? sortedInitialParticipants
        : [{ employeeId: currentEmployee.id, isPic: true, amount: 0 }],
  }

  const form = editTripProposalForm(
    proposalId,
    currentEmployee.id,
    initialValues,
  )

  const [participants, setParticipants] = useState<
    TripProposalParticipantInput[]
  >(initialValues.participants)

  // Ambil catatan revisi terakhir dari approvalHistory (bersih dari marker budget).
  const lastRevisionEntry = [...(proposal.approvalHistory || [])]
    .sort(
      (a, b) =>
        new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
    )
    .find((h) => {
      const cleanedNotes = stripBudgetMarker(h.notes)
      return (
        String(h.decision).toLowerCase().includes('revision') ||
        Boolean(cleanedNotes)
      )
    })

  const lastRevisionNotes = stripBudgetMarker(lastRevisionEntry?.notes)

  const existingFileName = proposal.filePath
    ? proposal.filePath.split(/[\\/]/).pop()?.split('?')[0] ||
      'Proposal_Letter'
    : null

  const updateParticipants = (
    newParticipants: TripProposalParticipantInput[],
  ) => {
    setParticipants(newParticipants)
    form.setFieldValue('participants', newParticipants)
  }

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

  const handleEmployeeChange = (index: number, employeeId: string) => {
    const updatedParticipants = participants.map((participant, i) =>
      i === index ? { ...participant, employeeId } : participant,
    )
    updateParticipants(updatedParticipants)
  }

  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index)
    updateParticipants(updatedParticipants)
  }

  const isFormChanged = (values: typeof form.state.values) => {
    const isDestChanged =
      values.destination.trim() !== initialValues.destination.trim()
    const isStartChanged = values.startDate !== initialValues.startDate
    const isEndChanged = values.endDate !== initialValues.endDate
    const isAmountChanged =
      Number(values.accommodationAmount) !==
      Number(initialValues.accommodationAmount)
    const isDescChanged =
      values.description.trim() !== initialValues.description.trim()
    const isFileChanged = Boolean(values.file)

    const initialIds = initialValues.participants
      .map((p) => `${p.employeeId}:${p.isPic}`)
      .join('|')
    const currentIds = (values.participants || [])
      .map((p) => `${p.employeeId}:${p.isPic}`)
      .join('|')
    const isParticipantsChanged = initialIds !== currentIds

    return (
      isDestChanged ||
      isStartChanged ||
      isEndChanged ||
      isAmountChanged ||
      isDescChanged ||
      isFileChanged ||
      isParticipantsChanged
    )
  }

  const isParticipantCountInvalid =
    hasAttemptedSubmit && participants.length < 1

  const hasEmptyParticipant = participants.some(
    (participant) => !participant.employeeId,
  )

  const isParticipantsInvalid =
    hasAttemptedSubmit && (isParticipantCountInvalid || hasEmptyParticipant)

  const handleReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setHasAttemptedSubmit(true)

    if (!isFormChanged(form.state.values)) {
      toast.info('No changes have been made to this trip proposal form yet.')
      return
    }

    await form.validateAllFields('submit')

    const values = form.state.values

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

    if (!values.accommodationAmount || values.accommodationAmount <= 0) {
      toast.error('Accommodation amount must be greater than 0.')
      return
    }

    if (participants.length < 1) {
      toast.error('At least one participant is required.')
      return
    }

    if (hasEmptyParticipant) {
      toast.error('Please select an employee for every participant.')
      return
    }

    if (!form.state.isValid) {
      toast.error('Please check the highlighted fields.')
      return
    }

    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    await form.handleSubmit()
    setDialogOpen(false)
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Page Header - Outside Form Card */}
      <div className="flex flex-col justify-between gap-3 pb-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <Link
            to="/trip-proposals/$id"
            params={{ id: proposalId }}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground"
            title="Back to Proposal Details"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                Revise Trip Proposal
              </h1>

              <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                #TRIP-{proposal.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Update the business trip details, participants, or assignment letter according to the reviewer notes.
            </p>
          </div>
        </div>
      </div>

      {/* Banner Catatan Reviewer (Alasan Revisi) */}
      {lastRevisionNotes && (
        <section className="space-y-2 rounded-xl border border-amber-300 bg-amber-50/70 p-4.5 shadow-2xs dark:border-amber-700 dark:bg-amber-950/40">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h2 className="text-sm font-bold">Revision Request Notes</h2>
            <span className="ml-auto text-xs font-normal text-amber-700/80 dark:text-amber-400">
              By: {lastRevisionEntry?.approverName || 'Reviewer'}
            </span>
          </div>

          <div className="pl-7">
            <p className="whitespace-pre-wrap rounded-lg border border-amber-200 bg-white/70 p-3 text-xs font-medium leading-relaxed text-amber-900 sm:text-sm dark:border-amber-900/60 dark:bg-black/20 dark:text-amber-200">
              "{lastRevisionNotes}"
            </p>
          </div>
        </section>
      )}

      {/* Main Form Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8">
        <form onSubmit={handleReview} className="space-y-7">
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
                    const endDate = form.state.values.endDate
                    if (value && endDate && value > endDate) {
                      return 'Start Date cannot be after End Date.'
                    }
                    return undefined
                  },
                }}
              >
                {(field) => <field.DatePicker label="Start Date" />}
              </form.AppField>

              {/* End Date */}
              <form.AppField
                name="endDate"
                validators={{
                  onChange: ({ value }) => {
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
                    minDate={form.state.values.startDate || undefined}
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
              Total accommodation and travel cost for the entire proposal,
              such as hotel and tickets. Not the reimbursement limit per participant.
            </p>
          </div>

          {/* SECTION 3: DESCRIPTION & DOCUMENT */}
          <div className="space-y-5">
            <form.AppField name="description">
              {(field) => (
                <field.TextArea
                  label="Revision Notes / Description"
                  placeholder="Describe the trip purpose and the fixes you have made..."
                  rows={5}
                />
              )}
            </form.AppField>

            {/* Lampiran Surat Proposal Lama (jika ada) */}
            {proposal.filePath && (
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Currently Attached Assignment / Proposal Letter
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void downloadFile(proposal.filePath, existingFileName)
                    }
                    className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Existing File
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  File name:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {existingFileName}
                  </span>
                  . If you do not upload a new file below, this existing file will continue to be used.
                </p>
              </div>
            )}

            <form.AppField name="file">
              {(field) => (
                <field.FileInput label="Proposal Letter (Optional if unchanged)" />
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
                    isParticipantsInvalid &&
                      'text-rose-600 dark:text-rose-400',
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

                const employeeGroups =
                  buildEmployeeGroups(availableEmployees)

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

                            {employeeGroups.map((group) => (
                              <optgroup
                                key={group.groupLabel}
                                label={group.groupLabel}
                              >
                                {group.items.map((item) => (
                                  <option key={item.value} value={item.value}>
                                    {item.label}
                                  </option>
                                ))}
                              </optgroup>
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

          {/* SECTION 5: SUBMIT ACTIONS */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link to="/trip-proposals/$id" params={{ id: proposalId }}>
              <Button type="button" variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </Link>
            <form.Subscribe
              selector={(state) => ({
                values: state.values,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ values, isSubmitting }) => {
                const hasChanges = isFormChanged(values)
                return (
                  <Button
                    type="submit"
                    disabled={!hasChanges || isSubmitting}
                    className="cursor-pointer bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title={
                      hasChanges
                        ? 'Resubmit proposal revision'
                        : 'Modify form details or upload a new file to submit revision'
                    }
                  >
                    Resubmit Revision
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>

          {/* Dialog Konfirmasi Submit */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Resubmit Trip Proposal Revision?</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Your trip proposal will be updated and sent back to the Manager for re-review.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                  className="cursor-pointer bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  {form.state.isSubmitting ? 'Submitting...' : 'Yes, Resubmit'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </main>
  )
}

function stripBudgetMarker(notes: string | null | undefined): string | null {
  if (!notes) return null
  const markerRegex =
    /^\[ACCOMMODATION_BUDGET:([0-9]+(?:\.[0-9]+)?)\|([0-9]+(?:\.[0-9]+)?)\]\r?\n?/
  const cleaned = notes.replace(markerRegex, '').trim()
  return cleaned || null
}