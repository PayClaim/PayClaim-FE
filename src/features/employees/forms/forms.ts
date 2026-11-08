import { useAppForm } from '#/hooks/demo.form'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from '../queries/queries'
import { createEmployeeSchema, updateEmployeeSchema } from './schemas'
import type { UpdateEmployeeRequest } from '#/types/employee.type'
import { toDateOnly } from '#/lib/utils'

export const createEmployeeForm = () => {
  const mutation = useCreateEmployeeMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      fullName: '',
      email: '',
      hireDate: new Date(),
      positionId: '',
      departmentId: '',
      managerId: null as string | null,
    },
    validators: {
      onBlur: createEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        hireDate: toDateOnly(value.hireDate),
      }
      try {
        mutation.mutate(payload)
        await navigate({
          to: '/admin/employees',
        })
      } catch (e) {
        console.log(e)
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
        mutation.mutate(value)
        await navigate({
          to: '/admin/employees',
        })
      } catch (err) {
        console.log(err)
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
        mutation.mutate(value.id)
        await navigate({
          to: '/admin/employees',
        })
      } catch (err) {
        console.log(err)
      }
    },
  })
}
