import { createFormHook } from '@tanstack/react-form'

import { Select, SubscribeButton } from '../components/demo.FormComponents'
import { fieldContext, formContext } from './demo.form-context'
import { FileInput, NumberField, TextField } from '#/components/forms/TextField'
import { FormSelect, FormSelectNumber } from '#/components/forms/FormSelect'
import { FormButton } from '#/components/forms/FormButton'
import { DatePicker } from '#/components/forms/DatePicker'
import { TextArea } from '#/components/forms/TextArea'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    FileInput,
    Select,
    FormSelect,
    FormSelectNumber,
    TextArea,
    DatePicker,
  },
  formComponents: {
    SubscribeButton,
    FormButton,
  },
  fieldContext,
  formContext,
})
