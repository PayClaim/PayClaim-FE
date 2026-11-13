import { useAppForm } from '#/hooks/app.form'
import type { UpdateDepartmentRequest } from '#/types/department.type'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useUpdateDepartmentMutation,
} from '../queries/queries'
import { createDepartmentSchema, updateDepartmentSchema } from './schemas'

export const createDepartmentForm = () => {
  const mutation = useCreateDepartmentMutation()
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: {
      id: '',
      name: '',
      parentDeptId: null as string | null,
    },
    validators: {
      onBlur: createDepartmentSchema,
    },
    onSubmit: async ({ value }) => {
      // const parentId = value.parentDeptId === '' ? null : value.parentDeptId
      // const submitted = {
      //   id: value.id,
      //   name: value.name,
      //   parenDeptId: parentId,
      // }
      // // Do something with form data
      try {
        mutation.mutate(value)
        await navigate({
          to: '/admin/departments',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}

export const editDepartmentForm = (
  id: string,
  initialValue: UpdateDepartmentRequest,
) => {
  const mutation = useUpdateDepartmentMutation(id)
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateDepartmentSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value)
        await navigate({
          to: '/admin/departments',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}

export const deleteDepartmentForm = (id: string) => {
  const mutation = useDeleteDepartmentMutation()
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: { id: id },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value.id)
        await navigate({
          to: '/admin/departments',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}
