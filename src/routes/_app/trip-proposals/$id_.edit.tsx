import { useState } from 'react'
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
import { useGetAllEmployeeQuery } from '#/features/employees/queries/queries'
import { useAuth } from '#/hooks/auth.hook'
import { downloadFile } from '#/lib/download'
import {
  TripProposalStatus,
  isTripStatus,
  type TripProposalDetailResponse,
  type TripProposalParticipantInput,
} from '#/types/tripProposals.type'
import type { EmployeeResponse } from '#/types/employee.type'

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
    isFetching,
  } = useGetProposalByIdQuery(id)
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useGetAllEmployeeQuery()

  if (isError) {
    return <ErrorComponent pageTitle="Revise Trip Proposal" error={error} />
  }

  if (isFetching || !proposal || !user || isLoadingEmployees) {
    return <LoadingComponent pageTitle="Revise Trip Proposal" />
  }

  const currentEmployee = employees.find(
    (employee) => employee.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (!currentEmployee) {
    return (
      <main className="max-w-2xl mx-auto py-10">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          Data karyawan untuk akun yang sedang login tidak ditemukan.
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
      <main className="max-w-2xl mx-auto space-y-4 py-8">
        <Link to="/trip-proposals/$id" params={{ id }}>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Detail Proposal</span>
          </Button>
        </Link>
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {!isPic
            ? 'Hanya PIC proposal yang dapat melakukan revisi pada pengajuan ini.'
            : 'Proposal ini tidak berstatus Needs Revision sehingga tidak dapat diubah.'}
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

  // Pastikan PIC berada di urutan pertama
  const sortedInitialParticipants: TripProposalParticipantInput[] = [
    ...(proposal.participants || []),
  ]
    .sort((a, b) => Number(b.isPic) - Number(a.isPic))
    .map((p) => ({
      employeeId: p.employeeId,
      isPic: p.isPic,
      amount: 0,
    }))

  const initialAccommodationAmount =
    proposal.accommodationAmount > 0
      ? proposal.accommodationAmount
      : proposal.totalAmount || 0

  const initialValues = {
    destination: proposal.destination || '',
    startDate: proposal.startDate?.slice(0, 10) || '',
    endDate: proposal.endDate?.slice(0, 10) || '',
    accommodationAmount: initialAccommodationAmount,
    description: proposal.description || '',
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

  const [accommodationAmountInput, setAccommodationAmountInput] = useState(
    initialAccommodationAmount > 0 ? String(initialAccommodationAmount) : '',
  )

  const [participants, setParticipants] = useState<
    TripProposalParticipantInput[]
  >(initialValues.participants)

  // Ambil catatan revisi terakhir dari approvalHistory
  const lastRevisionHistory = [...(proposal.approvalHistory || [])]
    .sort(
      (a, b) =>
        new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
    )
    .find(
      (h) =>
        String(h.decision).toLowerCase().includes('revision') ||
        Boolean(h.notes?.trim()),
    )

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

  const handleAccommodationAmountChange = (value: string) => {
    setAccommodationAmountInput(value)
    form.setFieldValue(
      'accommodationAmount',
      value === '' ? 0 : Number(value),
    )
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

  const isAccommodationAmountInvalid =
    hasAttemptedSubmit &&
    (!accommodationAmountInput ||
      !Number.isFinite(Number(accommodationAmountInput)) ||
      Number(accommodationAmountInput) <= 0)

  const isParticipantCountInvalid =
    hasAttemptedSubmit && participants.length < 1

  const hasEmptyParticipant = participants.some(
    (participant) => !participant.employeeId,
  )

  const isParticipantsInvalid =
    hasAttemptedSubmit && (isParticipantCountInvalid || hasEmptyParticipant)

  const handleReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setHasAttemptedSubmit(true)

    if (!isFormChanged(form.state.values)) {
      toast.info('Belum ada perubahan data pada formulir trip proposal ini.')
      return
    }

    await form.validateAllFields('submit')

    const values = form.state.values

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
      toast.error('Periksa kembali kolom yang ditandai merah.')
      return
    }

    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    await form.handleSubmit()
    setDialogOpen(false)
  }

  return (
    <main className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header navigasi */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/trip-proposals/$id"
            params={{ id: proposalId }}
            className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-heading">
              Revisi Trip Proposal #TRIP-{proposal.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbaiki rincian perjalanan, peserta, atau dokumen surat tugas sesuai catatan reviewer.
            </p>
          </div>
        </div>
      </div>

      {/* Banner Catatan Reviewer (Alasan Revisi) */}
      {lastRevisionHistory?.notes && (
        <section className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/40 p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-sm font-bold">Catatan Permintaan Revisi</h2>
            <span className="text-xs text-amber-700/80 dark:text-amber-400 font-normal ml-auto">
              Oleh: {lastRevisionHistory.approverName || 'Reviewer'}
            </span>
          </div>

          <div className="pl-7">
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed font-medium bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/60">
              "{lastRevisionHistory.notes}"
            </p>
          </div>
        </section>
      )}

      {/* Form Container */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs">
        <form onSubmit={handleReview} className="space-y-5">
          {/* Informasi Perjalanan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <form.AppField name="destination">
                {(field) => (
                  <field.TextField
                    label="Destination"
                    placeholder="Enter destination"
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="startDate">
              {(field) => <field.DatePicker label="Start Date" />}
            </form.AppField>

            <form.AppField name="endDate">
              {(field) => <field.DatePicker label="End Date" />}
            </form.AppField>
          </div>

          {/* Accommodation Amount */}
          <div>
            <label
              htmlFor="accommodationAmount"
              className={cn(
                'mb-2 block text-sm font-semibold transition-colors',
                isAccommodationAmountInvalid
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-(--sea-ink)',
              )}
            >
              Accommodation Amount (Hotel, Ticket)
            </label>

            <input
              id="accommodationAmount"
              type="number"
              min="0.01"
              step="0.01"
              aria-invalid={isAccommodationAmountInvalid}
              className={cn(
                'h-10 w-full rounded-md border border-border bg-input px-3 text-sm transition-all',
                isAccommodationAmountInvalid &&
                  'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20',
              )}
              value={accommodationAmountInput}
              placeholder="Enter accommodation amount"
              onChange={(event) =>
                handleAccommodationAmountChange(event.target.value)
              }
            />

            {isAccommodationAmountInvalid && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Accommodation amount must be greater than 0</span>
              </p>
            )}

            <p className="mt-1.5 text-xs text-muted-foreground">
              Total biaya akomodasi dan perjalanan untuk seluruh proposal, seperti hotel dan tiket.
            </p>
          </div>

          {/* Description */}
          <form.AppField name="description">
            {(field) => (
              <field.TextArea
                label="Keterangan / Penjelasan Revisi"
                placeholder="Tuliskan tujuan perjalanan dan perbaikan yang telah dilakukan..."
                rows={4}
              />
            )}
          </form.AppField>

          {/* Lampiran Surat Proposal Lama (jika ada) */}
          {proposal.filePath && (
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Surat Tugas / Proposal Terlampir Saat Ini
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void downloadFile(proposal.filePath, existingFileName)
                  }
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Berkas Lama
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Nama file:{' '}
                <span className="font-mono text-foreground font-medium">
                  {existingFileName}
                </span>
                . Jika Anda tidak mengunggah file baru di bawah, berkas lama ini akan tetap digunakan.
              </p>
            </div>
          )}

          {/* Upload Dokumen Baru */}
          <form.AppField name="file">
            {(field) => (
              <field.FileInput label="Unggah Surat Proposal Baru (Opsional jika tidak diganti)" />
            )}
          </form.AppField>

          {/* Participants */}
          <div className="pt-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2
                  className={cn(
                    'text-sm font-semibold',
                    isParticipantsInvalid &&
                      'text-rose-600 dark:text-rose-400',
                  )}
                >
                  Participants
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Minimal 1 peserta (PIC wajib disertakan).
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddParticipant}
              >
                Add Participant
              </Button>
            </div>

            <div
              className={cn(
                'space-y-3 rounded-lg',
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
                    className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border p-3.5 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <label
                        className={cn(
                          'mb-1.5 block text-xs font-semibold transition-colors',
                          isEmployeeInvalid
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-(--sea-ink)',
                        )}
                      >
                        Employee
                      </label>

                      {participant.isPic ? (
                        <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
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
                        <span className="rounded-md bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                          PIC
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
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
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <Link to="/trip-proposals/$id" params={{ id: proposalId }}>
              <Button type="button" variant="outline" className="cursor-pointer">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Dialog Konfirmasi Submit */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Kirim Ulang Revisi Trip Proposal?</DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  Proposal perjalanan Anda akan diperbarui dan dikirim kembali ke Manager untuk dilakukan peninjauan ulang.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  {form.state.isSubmitting ? 'Mengirim...' : 'Ya, Kirim Ulang'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </main>
  )
}