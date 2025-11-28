import type { ColumnDef } from "@tanstack/react-table"

export interface TableConfig<T> {
  columns: ColumnDef<T>[]
  data: T[]
  enablePagination?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  pageSize?: number
}

export function createTableConfig<T>(config: TableConfig<T>) {
  return config
}
