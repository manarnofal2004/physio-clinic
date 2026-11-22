import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { GENDERS, type Patient } from "@shared/api-types";
import { FormSelect, FormTextField } from "@/components";
import { usePatientMutations } from "./api";
import {
  createPatientSchema,
  emptyPatientValues,
  toPatientInput,
  toPatientValues,
  type PatientValues,
} from "./patientSchema";

// Add a patient (patient is null) or edit one. The parent opens it only when needed,
// so every opening starts with a fresh form.
export const PatientDialog = ({
  patient,
  onClose,
  onSaved,
}: {
  patient: Patient | null;
  onClose: () => void;
  onSaved: (patient: Patient) => void;
}) => {
  const { t } = useTranslation();
  const { create, update } = usePatientMutations();
  const mutation = patient ? update : create;

  // Rebuilt when the language changes, so the messages follow it.
  const schema = useMemo(() => createPatientSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PatientValues>({
    resolver: zodResolver(schema),
    defaultValues: patient ? toPatientValues(patient) : emptyPatientValues,
  });

  const genderOptions = GENDERS.map((gender) => ({
    value: gender,
    label: t(`patientsAdmin.genders.${gender}`),
  }));

  // Runs only when the form is valid. A failed request is shown by the alert below.
  const save = handleSubmit(async (values) => {
    const input = toPatientInput(values);
    try {
      const saved = patient
        ? await update.mutateAsync({ id: patient.id, input })
        : await create.mutateAsync(input);
      onSaved(saved);
    } catch {
      // mutation.isError is now true
    }
  });

  return (
    <Dialog open onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={save} noValidate>
        <DialogTitle>{patient ? t("patientsAdmin.edit") : t("patientsAdmin.add")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <FormTextField
              name="fullName"
              control={control}
              label={t("patientsAdmin.fullName")}
              required
              autoFocus
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormTextField
                name="phone"
                control={control}
                label={t("patientsAdmin.phone")}
                required
                slotProps={{ htmlInput: { dir: "ltr", inputMode: "tel" } }}
              />
              <FormTextField
                name="age"
                control={control}
                label={t("patientsAdmin.age")}
                required
                slotProps={{ htmlInput: { inputMode: "numeric" } }}
              />
              <FormSelect
                name="gender"
                control={control}
                label={t("patientsAdmin.gender")}
                required
                options={genderOptions}
              />
            </Stack>
            <FormTextField
              name="condition"
              control={control}
              label={t("patientsAdmin.condition")}
              required
            />
            <FormTextField
              name="address"
              control={control}
              label={t("patientsAdmin.address")}
              helperText={t("patientsAdmin.optional")}
            />
            <FormTextField
              name="notes"
              control={control}
              label={t("patientsAdmin.notes")}
              helperText={t("patientsAdmin.optional")}
              multiline
              minRows={3}
            />
            {mutation.isError && <Alert severity="error">{t("patientsAdmin.errors.failed")}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t("patientsAdmin.cancel")}
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {t("patientsAdmin.save")}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
