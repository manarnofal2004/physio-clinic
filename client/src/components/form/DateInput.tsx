import type { SxProps, Theme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface DateInputProps {
  label: string;
  /** A calendar day as "YYYY-MM-DD", or "" for none. */
  value: string;
  onChange: (value: string) => void;
  /** The latest day that can be picked, as "YYYY-MM-DD". */
  max?: string;
  size?: "small" | "medium";
  error?: boolean;
  helperText?: string;
  clearable?: boolean;
  sx?: SxProps<Theme>;
}

// A date field that reads DD/MM/YYYY in both languages, with a calendar in the
// page language. The browser's own date input follows the computer's settings
// (mm/dd/yyyy) instead.
export const DateInput = ({
  label,
  value,
  onChange,
  max,
  size,
  error,
  helperText,
  clearable,
  sx,
}: DateInputProps) => (
  <DatePicker
    label={label}
    format="DD/MM/YYYY"
    value={value ? dayjs(value) : null}
    onChange={(day) => onChange(day && day.isValid() ? day.format("YYYY-MM-DD") : "")}
    maxDate={max ? dayjs(max) : undefined}
    slotProps={{
      textField: { size, error, helperText, sx },
      field: { clearable },
    }}
  />
);
