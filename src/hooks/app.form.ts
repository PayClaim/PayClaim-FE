import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from './demo.form-context'
import {
  CurrencyField,
  FileInput,
  NumberField,
  TextField,
} from '#/components/forms/TextField'
import { FormSelect, FormSelectNumber } from '#/components/forms/FormSelect'
import { FormButton } from '#/components/forms/FormButton'
import { DatePicker } from '#/components/forms/DatePicker'
import { TextArea } from '#/components/forms/TextArea'
import { FormComboBox } from '#/components/forms/FormComboBox'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    CurrencyField,
    FileInput,
    FormSelect,
    FormSelectNumber,
    TextArea,
    DatePicker,
    FormComboBox,
  },
  formComponents: {
    FormButton,
  },
  fieldContext,
  formContext,
})
