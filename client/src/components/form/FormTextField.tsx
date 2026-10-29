import { TextField, type TextFieldProps } from "@mui/material";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";

type FormTextFieldProps<T extends FieldValues> = Omit<TextFieldProps, "name" | "defaultValue"> & {
  name: Path<T>;
  control: Control<T>;
};

export function FormTextField<T extends FieldValues>({
  name,
  control,
  helperText,
  ...textFieldProps
}: FormTextFieldProps<T>) {
  const { field, fieldState } = useController({ name, control });

  return (
    <TextField
      fullWidth
      {...textFieldProps}
      {...field}
      value={field.value ?? ""}
      error={Boolean(fieldState.error)}
      helperText={fieldState.error?.message ?? helperText}
    />
  );
}
