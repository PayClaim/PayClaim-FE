
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

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

import { editTripProposalForm } from '#/features/trip-proposals/forms/forms'
import { TripProposalParticipants } from '#/features/trip-proposals/components/TripProposalParticipants'

import {
  getFileName,
  MAX_TRIP_AMOUNT,
  parseAccommodationBudgetNotes,
} from '#/features/trip-proposals/utils/tripProposalDetailUtils'

import { downloadFile } from '#/lib/download'

import type { EmployeeResponse } from '#/types/employee.type'
import type {
  TripProposalDetailResponse,
  TripProposalParticipantInput,
} from '#/types/tripProposals.type'

type Props = {
  proposalId: string
  proposal: TripProposalDetailResponse
  currentEmployee: EmployeeResponse
  employees: EmployeeResponse[]
}

export function TripProposalEditForm({
  proposalId,
  proposal,
  currentEmployee,
  employees,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Pastikan PIC berada di urutan pertama.
  const sortedInitialParticipants: TripProposalParticipantInput[] = [
    ...(proposal.participants || []),
  ]
    .sort((a, b) => Number(b.isPic) - Number(a.isPic))
    .map((participant) => ({
      employeeId: participant.employeeId,
      isPic: participant.isPic,
      amount: participant.amount ?? 0,
    }))

  // Pertahankan fallback yang sebelumnya digunakan oleh form Edit.
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
        : [
            {
              employeeId: currentEmployee.id,
              isPic: true,
              amount: 0,
            },
          ],
  }

  const form = editTripProposalForm(
    proposalId,
    currentEmployee.id,
    initialValues,
  )

  const [participants, setParticipants] = useState<
    TripProposalParticipantInput[]
  >(initialValues.participants)

  // Ambil catatan dari riwayat revisi terakhir.
  // Catatan approval biasa tidak dianggap sebagai catatan revisi.
  const lastRevisionEntry = [...(proposal.approvalHistory || [])]
    .sort(
      (a, b) =>
        new Date(b.decidedAt).getTime() -
        new Date(a.decidedAt).getTime(),
    )
    .find((history) =>
      String(history.decision)
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .includes('revision'),
    )

  const lastRevisionNotes = parseAccommodationBudgetNotes(
    lastRevisionEntry?.notes,
  ).notes

const existingFileName =
  getFileName(proposal.filePath || '') || 'Proposal_Letter'

  // Sinkronkan state peserta dengan field form TanStack.
  const updateParticipants = (
    newParticipants: TripProposalParticipantInput[],
  ) => {
    setParticipants(newParticipants)
    form.setFieldValue('participants', newParticipants)
  }

  // Memeriksa apakah ada perubahan pada form.
  const isFormChanged = (values: typeof form.state.values) => {
    const isDestChanged =
      values.destination.trim() !== initialValues.destination.trim()

    const isStartChanged =
      values.startDate !== initialValues.startDate

    const isEndChanged =
      values.endDate !== initialValues.endDate

    const isAmountChanged =
      Number(values.accommodationAmount) !==
      Number(initialValues.accommodationAmount)

    const isDescChanged =
      values.description.trim() !== initialValues.description.trim()

    const isFileChanged = Boolean(values.file)

const initialIds = initialValues.participants
  .map(
    (participant) =>
      `${participant.employeeId}:${participant.isPic}:${participant.amount}`,
  )
  .join('|')

const currentIds = (values.participants || [])
  .map(
    (participant) =>
      `${participant.employeeId}:${participant.isPic}:${participant.amount}`,
  )
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

  const hasEmptyParticipant = participants.some(
    (participant) => !participant.employeeId,
  )

  const handleReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setHasAttemptedSubmit(true)

    if (!isFormChanged(form.state.values)) {
      toast.info(
        'Belum ada perubahan data pada formulir trip proposal ini.',
      )
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

    if (Number(values.accommodationAmount) > MAX_TRIP_AMOUNT) {
      toast.error('Maximum Accommodation Amount is Rp 100.000.000.')
      return
    }

    if (
      !values.accommodationAmount ||
      Number(values.accommodationAmount) <= 0
    ) {
      toast.error('Accommodation amount must be greater than 0.')
      return
    }

    if (participants.length < 1) {
      toast.error('At least one participant is required.')
      return
    }

    if (hasEmptyParticipant) {
      toast.error(
        'Please select an employee for every participant.',
      )
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
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-3 pb-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <Link
            to="/trip-proposals/$id"
            params={{ id: proposalId }}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground"
            title="Kembali ke Detail Proposal"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
                Revisi Trip Proposal
              </h1>

              <span className="rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                #TRIP-{proposal.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Perbaiki rincian perjalanan dinas, peserta, atau surat tugas
              sesuai catatan dari reviewer.
            </p>
          </div>
        </div>
      </div>

      {/* Reviewer Revision Notes */}
      {lastRevisionNotes && (
        <section className="space-y-2 rounded-xl border border-amber-300 bg-amber-50/70 p-4.5 shadow-2xs dark:border-amber-700 dark:bg-amber-950/40">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0" />

            <h2 className="text-sm font-bold">
              Catatan Permintaan Revisi
            </h2>

            <span className="ml-auto text-xs font-normal text-amber-700/80 dark:text-amber-400">
              Oleh: {lastRevisionEntry?.approverName || 'Reviewer'}
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
              Total biaya akomodasi dan perjalanan untuk seluruh proposal,
              seperti hotel dan tiket. Bukan limit reimbursement per peserta.
            </p>
          </div>

          {/* SECTION 3: DESCRIPTION & DOCUMENT */}
          <div className="space-y-5">
            <form.AppField name="description">
              {(field) => (
                <field.TextArea
                  label="Keterangan / Penjelasan Revisi"
                  placeholder="Tuliskan tujuan perjalanan dan perbaikan yang telah dilakukan..."
                  rows={5}
                />
              )}
            </form.AppField>

            {/* Existing Proposal Letter */}
            {proposal.filePath && (
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Surat Tugas / Proposal Terlampir Saat Ini
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                    void downloadFile(proposal.filePath, existingFileName)
                    }
                    className="inline-flex cursor-pointer items-center gap-1 font-semibold text-primary hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    Unduh Berkas Lama
                  </button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Nama file:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {existingFileName}
                  </span>
                  . Jika Anda tidak mengunggah file baru di bawah, berkas
                  lama ini akan tetap digunakan.
                </p>
              </div>
            )}

            <form.AppField name="file">
              {(field) => (
                <field.FileInput label="Proposal Letter (Opsional jika tidak diganti)" />
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

          {/* SECTION 5: SUBMIT ACTIONS */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <Link
              to="/trip-proposals/$id"
              params={{ id: proposalId }}
            >
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Batal
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
                        ? 'Ajukan ulang revisi proposal'
                        : 'Lakukan perubahan data atau unggah berkas baru untuk mengajukan revisi'
                    }
                  >
                    Ajukan Ulang Revisi
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>

          {/* Confirmation Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Kirim Ulang Revisi Trip Proposal?
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs">
                  Proposal perjalanan Anda akan diperbarui dan dikirim
                  kembali ke Manager untuk dilakukan peninjauan ulang.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-4 gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Batal
                  </Button>
                </DialogClose>

                <Button
                  type="button"
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                  className="cursor-pointer bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  {form.state.isSubmitting
                    ? 'Mengirim...'
                    : 'Ya, Kirim Ulang'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </main>
  )
}
