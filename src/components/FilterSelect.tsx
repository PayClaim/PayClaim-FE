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
  val: T
  options: {
    label: string
    optionValue: T
  }[]
  setValue: (v: T) => void
}

export function FilterSelect({
  filterLabel,
  val,
  options,
  setValue,
}: FilterSelectProps<string>) {
  return (
    <ButtonGroup>
      <Button variant="outline" disabled>
        {filterLabel}
      </Button>
      <Select value={val} onValueChange={(value) => setValue(value)}>
        <SelectTrigger>
          <SelectValue placeholder="No Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={''}>No Filter</SelectItem>
            {options.map((op) => (
              <SelectItem value={op.optionValue}>{op.label}</SelectItem>
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
}: FilterSelectProps<number>) {
  return (
    <ButtonGroup>
      <Button variant="outline" disabled>
        {filterLabel}
      </Button>
      <Select
        value={String(val)}
        onValueChange={(value) => setValue(Number(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="No Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={String(0)}>No Filter</SelectItem>
            {options.map((op) => (
              <SelectItem value={String(op.optionValue)}>{op.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ButtonGroup>
  )
}
