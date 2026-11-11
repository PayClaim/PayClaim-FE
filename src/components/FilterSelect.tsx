import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface FilterSelectProps<T extends string | number> {
  filterLabel: string
  val: T | null
  options: {
    label: string
    optionValue: T
  }[]
  setValue: (v: T | null) => void
  nullable?: boolean
  nullLabel?: string
  className?: string
}

const NULL_VALUE = '__null__'

export function FilterSelect({
  filterLabel,
  val,
  options,
  setValue,
  nullLabel = 'None',
  nullable = false,
}: FilterSelectProps<string>) {
  const radixValue =
    val === null
      ? nullable
        ? NULL_VALUE // null terpilih -> item "None" tampil
        : '' // tidak nullable -> placeholder
      : val

  return (
    <ButtonGroup>
      <Button variant="outline" disabled>
        {filterLabel}
      </Button>
      <Select
        value={radixValue}
        onValueChange={(raw) => {
          setValue(raw === NULL_VALUE ? null : raw)
        }}
      >
        <SelectTrigger className="">
          <SelectValue placeholder="No Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              value={NULL_VALUE}
              className="text-muted-foreground w-full"
            >
              {nullLabel}
            </SelectItem>
            {options.map((op) => (
              <SelectItem key={op.optionValue} value={op.optionValue}>
                {op.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ButtonGroup>
  )
}

export function FilterSelectNumber({
  filterLabel,
  val,
  options,
  setValue,
  nullLabel = 'None',
  nullable = false,
}: FilterSelectProps<number>) {
  const radixValue =
    val === null
      ? nullable
        ? NULL_VALUE // null terpilih -> item "None" tampil
        : '' // tidak nullable -> placeholder
      : String(val)

  return (
    <ButtonGroup>
      <Button variant="outline" disabled>
        {filterLabel}
      </Button>
      <Select
        value={radixValue}
        onValueChange={(raw) => {
          setValue(raw === NULL_VALUE ? null : Number(raw))
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="No Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={NULL_VALUE}>{nullLabel}</SelectItem>
            {options.map((op) => (
              <SelectItem key={op.optionValue} value={String(op.optionValue)}>
                {op.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ButtonGroup>
  )
}
