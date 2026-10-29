import type { ReactNode } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";

export type SortDirection = "asc" | "desc";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: number | string;
}

export interface DataTablePaginationLabels {
  rowsPerPage: string;
  displayedRows: (info: { from: number; to: number; count: number }) => string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Total number of rows on the server, not only the current page. */
  total: number;
  /** Zero-based page index. Convert at the call site if the API is one-based. */
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  sortBy?: string;
  sortDirection?: SortDirection;
  onSortChange?: (sortBy: string, direction: SortDirection) => void;
  onRowClick?: (row: T) => void;
  rowsPerPageOptions?: number[];
  paginationLabels?: DataTablePaginationLabels;
  ariaLabel?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  sortBy,
  sortDirection = "asc",
  onSortChange,
  onRowClick,
  rowsPerPageOptions = [10, 25, 50],
  paginationLabels,
  ariaLabel,
}: DataTableProps<T>) {
  const handleSort = (columnId: string) => {
    if (!onSortChange) return;
    const isActive = sortBy === columnId;
    onSortChange(columnId, isActive && sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table aria-label={ariaLabel}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ width: column.width, fontWeight: 600 }}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                    </TableSortLabel>
                  ) : (
                    column.header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        labelRowsPerPage={paginationLabels?.rowsPerPage}
        labelDisplayedRows={paginationLabels?.displayedRows}
      />
    </Paper>
  );
}
