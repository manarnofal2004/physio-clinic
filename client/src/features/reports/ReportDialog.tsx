import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Attachment, PatientSummary, Report, ReportProgress } from "@shared/api-types";
import { useAuth } from "@/features/auth/useAuth";
import { usePatientOptions, useTherapistOptions } from "@/features/users/api";
import { useReportMutations } from "./api";
import { FileUploader } from "./FileUploader";
import { ProgressChip } from "./ProgressChip";

const PROGRESS: ReportProgress[] = ["improving", "stable", "worse"];
const today = () => new Date().toISOString().slice(0, 10);
// Midday, so the calendar day never shifts with the time zone.
const toIso = (day: string) => new Date(`${day}T12:00:00`).toISOString();

// Write or edit a report: the patient, the day, the diagnosis and treatment plan,
// session notes, how the patient is doing, and attached images or PDFs. The admin
// also picks the physiotherapist; a therapist's own reports are theirs.
export const ReportDialog = ({
  report,
  patient,
  onClose,
  onSaved,
}: {
  report: Report | null;
  patient?: PatientSummary; // a fixed patient, e.g. from the patient's page
  onClose: () => void;
  onSaved: (saved: Report) => void;
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { create, update } = useReportMutations();
  const [search, setSearch] = useState("");
  const patients = usePatientOptions(search);
  const therapists = useTherapistOptions();

  const [chosen, setChosen] = useState<PatientSummary | null>(report?.patient ?? patient ?? null);
  const [therapistId, setTherapistId] = useState(report?.therapistId ?? "");
  const [day, setDay] = useState(report ? report.date.slice(0, 10) : today());
  const [diagnosis, setDiagnosis] = useState(report?.diagnosis ?? "");
  const [plan, setPlan] = useState(report?.treatmentPlan ?? "");
  const [notes, setNotes] = useState(report?.sessionNotes ?? "");
  const [progress, setProgress] = useState<ReportProgress>(report?.progress ?? "improving");
  const [files, setFiles] = useState<Attachment[]>(report?.attachments ?? []);
  const [tried, setTried] = useState(false);
  const [failed, setFailed] = useState(false);
  const saving = create.isPending || update.isPending;

  const errors = {
    patient: !chosen,
    day: !day,
    diagnosis: diagnosis.trim().length < 2 || diagnosis.length > 2000,
    plan: plan.trim().length < 2 || plan.length > 2000,
    notes: notes.length > 5000,
  };

  const save = () => {
    setTried(true);
    setFailed(false);
    if (Object.values(errors).some(Boolean) || !chosen) return;
    const input = {
      patientId: chosen.id,
      ...(therapistId && { therapistId }),
      date: toIso(day),
      diagnosis: diagnosis.trim(),
      treatmentPlan: plan.trim(),
      ...(notes.trim() && { sessionNotes: notes.trim() }),
      progress,
      attachmentIds: files.map((f) => f.id),
    };
    const done = { onSuccess: onSaved, onError: () => setFailed(true) };
    if (report) update.mutate({ id: report.id, input }, done);
    else create.mutate(input, done);
  };

  const options = (patients.data ?? []).map((p) => ({ id: p.id, fullName: p.fullName }));

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{report ? t("reportsAdmin.edit") : t("reportsAdmin.add")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Autocomplete
              sx={{ flex: 2 }}
              disabled={Boolean(report || patient)}
              options={options}
              value={chosen}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              getOptionLabel={(p) => p.fullName}
              filterOptions={(x) => x}
              onInputChange={(_, text, reason) => reason === "input" && setSearch(text)}
              onChange={(_, p) => setChosen(p)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("reportsAdmin.patient")}
                  error={tried && errors.patient}
                  helperText={
                    tried && errors.patient ? t("reportsAdmin.errors.patient") : undefined
                  }
                />
              )}
            />
            <TextField
              sx={{ flex: 1 }}
              type="date"
              label={t("reportsAdmin.date")}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              error={tried && errors.day}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today() } }}
            />
          </Stack>

          {isAdmin && (
            <TextField
              select
              label={t("reportsAdmin.therapist")}
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              helperText={t("reportsAdmin.optional")}
            >
              <MenuItem value="">{t("reportsAdmin.noTherapist")}</MenuItem>
              {(therapists.data ?? []).map((x) => (
                <MenuItem key={x.id} value={x.id}>
                  {x.fullName}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label={t("reportsAdmin.diagnosis")}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            multiline
            minRows={2}
            error={tried && errors.diagnosis}
            helperText={tried && errors.diagnosis ? t("reportsAdmin.errors.text") : undefined}
          />
          <TextField
            label={t("reportsAdmin.plan")}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            multiline
            minRows={2}
            error={tried && errors.plan}
            helperText={tried && errors.plan ? t("reportsAdmin.errors.text") : undefined}
          />
          <TextField
            label={t("reportsAdmin.notes")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={3}
            error={tried && errors.notes}
            helperText={t("reportsAdmin.optional")}
          />

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              {t("reportsAdmin.progressLabel")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={progress}
              onChange={(_, next: ReportProgress | null) => next && setProgress(next)}
              sx={{ "& .MuiToggleButton-root": { px: 1.5, textTransform: "none", gap: 1 } }}
            >
              {PROGRESS.map((p) => (
                <ToggleButton key={p} value={p}>
                  <ProgressChip progress={p} dotOnly />
                  {t(`reportsAdmin.progress.${p}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{t("reportsAdmin.files.title")}</Typography>
            <FileUploader value={files} onChange={setFiles} />
          </Box>

          {failed && <Alert severity="error">{t("reportsAdmin.errors.failed")}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t("reportsAdmin.cancel")}
        </Button>
        <Button variant="contained" onClick={save} loading={saving}>
          {t("reportsAdmin.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
