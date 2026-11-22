import type { ReactNode } from "react";
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
} from "@mui/material";
import type { Theme } from "@mui/material";

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
  /** Shown inside the table when there are no rows. Pagination is hidden when total is 0. */
  emptyState?: ReactNode;
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
  emptyState,
}: DataTableProps<T>) {
  const isPhone = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const handleSort = (columnId: string) => {
    if (!onSortChange) return;
    const isActive = sortBy === columnId;
    onSortChange(columnId, isActive && sortDirection === "asc" ? "desc" : "asc");
  };

  const pagination = !(total === 0 && emptyState) && (
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
  );

  // On phones a wide table hides its last columns, so each row becomes a short
  // stack: the first column as its title, then "label  value" lines.
  if (isPhone) {
    const [first, ...rest] = columns;
    return (
      <Paper variant="outlined" aria-label={ariaLabel} role="list">
        {rows.length === 0 && emptyState}
        {rows.map((row) => (
          <Box
            key={getRowId(row)}
            role="listitem"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              cursor: onRowClick ? "pointer" : undefined,
            }}
          >
            {first && <Box sx={{ mb: 0.75, fontWeight: 600 }}>{first.render(row)}</Box>}
            {rest.map((column) => (
              <Stack
                key={column.id}
                direction="row"
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "center", py: 0.4 }}
              >
                {column.header ? (
                  <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {column.header}
                  </Typography>
                ) : (
                  <span />
                )}
                <Box sx={{ minWidth: 0, textAlign: "end" }}>{column.render(row)}</Box>
              </Stack>
            ))}
          </Box>
        ))}
        {pagination}
      </Paper>
    );
  }

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
            {rows.length === 0 && emptyState && (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ borderBottom: 0 }}>
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
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
      {pagination}
    </Paper>
  );
}
