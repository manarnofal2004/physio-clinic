import { MenuItem, TextField, type TextFieldProps } from "@mui/material";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
}

type FormSelectProps<T extends FieldValues> = Omit<
  TextFieldProps,
  "name" | "defaultValue" | "select" | "children"
> & {
  name: Path<T>;
  control: Control<T>;
  options: SelectOption[];
};

export function FormSelect<T extends FieldValues>({
  name,
  control,
  options,
  helperText,
  ...textFieldProps
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <TextField
      select
      fullWidth
      {...textFieldProps}
      {...field}
      value={field.value ?? ""}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
