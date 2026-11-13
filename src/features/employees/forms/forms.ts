import { useAppForm } from '#/hooks/app.form'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from '../queries/queries'
import { createEmployeeSchema, updateEmployeeSchema } from './schemas'
import type { UpdateEmployeeRequest } from '#/types/employee.type'
import { toDateOnly } from '#/lib/utils'
import { toast } from 'sonner'
import { getFriendlyErrorMessage } from '#/lib/error'

export const createEmployeeForm = () => {
  const mutation = useCreateEmployeeMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      fullName: '',
      email: '',
      hireDate: toDateOnly(new Date()),
      positionId: '',
      departmentId: '',
      managerId: null as string | null,
    },
    validators: {
      onBlur: createEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const isManager =
          value.positionId?.toUpperCase() === 'MGR' ||
          value.positionId?.toLowerCase().includes('manager')
        const payload = {
          ...value,
          managerId: isManager ? null : value.managerId,
        }
        await mutation.mutateAsync(payload)
        toast.success('Employee created successfully')
        await navigate({
          to: '/admin/employees',
        })
      } catch (e: unknown) {
        toast.error(getFriendlyErrorMessage(e, 'Gagal menambahkan karyawan'))
      }
    },
  })
}

export const editEmployeeForm = (
  id: string,
  initialValue: UpdateEmployeeRequest,
) => {
  const mutation = useUpdateEmployeeMutation(id)
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const isManager =
          value.positionId?.toUpperCase() === 'MGR' ||
          value.positionId?.toLowerCase().includes('manager')
        const payload = {
          ...value,
          managerId: isManager ? null : value.managerId,
        }
        await mutation.mutateAsync(payload)
        toast.success('Employee updated successfully')
        await navigate({
          to: '/admin/employees',
        })
      } catch (err: unknown) {
        toast.error(getFriendlyErrorMessage(err, 'Gagal memperbarui data karyawan'))
      }
    },
  })
}

export const deleteEmployeeForm = (id: string) => {
  const mutation = useDeleteEmployeeMutation()
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: { id: id },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value.id)
        toast.success('Employee deactivated successfully')
        await navigate({
          to: '/admin/employees',
        })
      } catch (err: unknown) {
        toast.error(getFriendlyErrorMessage(err, 'Gagal menonaktifkan karyawan'))
      }
    },
  })
}
