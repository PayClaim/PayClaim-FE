import type { SelectOptionGroup } from '#/components/forms/FormSelect'
import type { EmployeeResponse } from '#/types/employee.type'

interface BuildEmployeeGroupsOptions {
  /** Filter employee yang ditampilkan (mis. hanya yang aktif). */
  filter?: (employee: EmployeeResponse) => boolean
  /** Label tiap opsi; default: nama lengkap + nomor karyawan. */
  label?: (employee: EmployeeResponse) => string
  /** Value tiap opsi; default: employee.id. */
  value?: (employee: EmployeeResponse) => string
}

/**
 * Mengelompokkan opsi employee berdasarkan departemen, agar dropdown
 * mudah dipindai ketika jumlah karyawan banyak.
 */
export function buildEmployeeGroups(
  employees: EmployeeResponse[],
  options: BuildEmployeeGroupsOptions = {},
): SelectOptionGroup[] {
  const { filter, label, value } = options

  const groupMap = new Map<
    string,
    Array<{ label: string; value: string }>
  >()

  employees
    .filter((employee) => (filter ? filter(employee) : true))
    .forEach((employee) => {
      const groupLabel =
        employee.departmentName?.trim() || 'No Department'

      if (!groupMap.has(groupLabel)) {
        groupMap.set(groupLabel, [])
      }

      groupMap.get(groupLabel)!.push({
        label: label
          ? label(employee)
          : `${employee.fullName} (${employee.number})`,
        value: value ? value(employee) : employee.id,
      })
    })

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupLabel, items]) => ({
      groupLabel,
      items: items.sort((a, b) => a.label.localeCompare(b.label)),
    }))
}
