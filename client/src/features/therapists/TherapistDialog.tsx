import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Therapist, WorkDay, WorkingHours } from "@shared/api-types";
import { toInput, useTherapistMutations } from "./api";
import { CLOSE, DAYS, OPEN, TIMES, dayName, toMinutes } from "./schedule";

type Hours = Record<WorkDay, { on: boolean; start: string; end: string }>;

const fromSchedule = (schedule: WorkingHours[]): Hours =>
  Object.fromEntries(
    DAYS.map((day) => {
      const h = schedule.find((s) => s.day === day);
      return [
        day,
        h ? { on: true, start: h.start, end: h.end } : { on: false, start: OPEN, end: "14:00" },
      ];
    }),
  ) as Hours;

// Add a physiotherapist or edit one: name, phone, specialty, whether they take new
// sessions, and their working hours for each clinic day (one block per day).
export const TherapistDialog = ({
  therapist,
  onClose,
  onSaved,
}: {
  therapist: Therapist | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const { create, update } = useTherapistMutations();
  const start = therapist ? toInput(therapist) : null;
  const [fullName, setFullName] = useState(start?.fullName ?? "");
  const [phone, setPhone] = useState(start?.phone ?? "");
  const [specialty, setSpecialty] = useState(start?.specialty ?? "");
  const [isActive, setIsActive] = useState(start?.isActive ?? true);
  const [hours, setHours] = useState<Hours>(
    fromSchedule(start?.schedule ?? DAYS.map((day) => ({ day, start: OPEN, end: "14:00" }))),
  );
  const [tried, setTried] = useState(false);
  const [error, setError] = useState(false);
  const saving = create.isPending || update.isPending;

  const setDay = (day: WorkDay, patch: Partial<Hours[WorkDay]>) =>
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }));

  const errors = {
    fullName: fullName.trim().length < 2 || fullName.trim().length > 120,
    phone: phone.trim() !== "" && (phone.trim().length < 6 || phone.trim().length > 30),
    specialty: specialty.trim().length > 120,
    schedule: !DAYS.some((d) => hours[d].on),
    times: DAYS.some((d) => hours[d].on && toMinutes(hours[d].end) <= toMinutes(hours[d].start)),
  };

  const save = () => {
    setTried(true);
    setError(false);
    if (Object.values(errors).some(Boolean)) return;
    const input = {
      fullName: fullName.trim(),
      ...(phone.trim() && { phone: phone.trim() }),
      ...(specialty.trim() && { specialty: specialty.trim() }),
      isActive,
      schedule: DAYS.filter((d) => hours[d].on).map((day) => ({
        day,
        start: hours[day].start,
        end: hours[day].end,
      })),
    };
    const done = { onSuccess: onSaved, onError: () => setError(true) };
    if (therapist) update.mutate({ id: therapist.id, input }, done);
    else create.mutate(input, done);
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{therapist ? t("therapistsAdmin.edit") : t("therapistsAdmin.add")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label={t("therapistsAdmin.fullName")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={tried && errors.fullName}
            helperText={tried && errors.fullName ? t("therapistsAdmin.errors.fullName") : undefined}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label={t("therapistsAdmin.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={tried && errors.phone}
              helperText={
                tried && errors.phone
                  ? t("therapistsAdmin.errors.phone")
                  : t("therapistsAdmin.optional")
              }
              slotProps={{ htmlInput: { dir: "ltr", inputMode: "tel" } }}
            />
            <TextField
              fullWidth
              label={t("therapistsAdmin.specialty")}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              error={tried && errors.specialty}
              helperText={t("therapistsAdmin.optional")}
            />
          </Stack>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{t("therapistsAdmin.hours")}</Typography>
            <Stack spacing={1}>
              {DAYS.map((day) => {
                const h = hours[day];
                const bad = tried && h.on && toMinutes(h.end) <= toMinutes(h.start);
                return (
                  <Stack
                    key={day}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: h.on ? "action.hover" : "transparent",
                    }}
                  >
                    <FormControlLabel
                      sx={{ minWidth: 120, m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={h.on}
                          onChange={(e) => setDay(day, { on: e.target.checked })}
                        />
                      }
                      label={dayName(day, i18n.language, "long")}
                    />
                    {h.on ? (
                      <>
                        <TextField
                          select
                          size="small"
                          label={t("therapistsAdmin.from")}
                          value={h.start}
                          onChange={(e) => setDay(day, { start: e.target.value })}
                          error={bad}
                          sx={{ width: 110 }}
                        >
                          {TIMES.slice(0, -1).map((time) => (
                            <MenuItem key={time} value={time} dir="ltr">
                              {time}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          size="small"
                          label={t("therapistsAdmin.to")}
                          value={h.end}
                          onChange={(e) => setDay(day, { end: e.target.value })}
                          error={bad}
                          sx={{ width: 110 }}
                        >
                          {TIMES.slice(1).map((time) => (
                            <MenuItem key={time} value={time} dir="ltr">
                              {time}
                            </MenuItem>
                          ))}
                        </TextField>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t("therapistsAdmin.dayOff")}
                      </Typography>
                    )}
                  </Stack>
                );
              })}
            </Stack>
            {tried && (errors.schedule || errors.times) && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errors.schedule
                  ? t("therapistsAdmin.errors.noDays")
                  : t("therapistsAdmin.errors.times")}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("therapistsAdmin.hoursHint", { open: OPEN, close: CLOSE })}
            </Typography>
          </Box>

          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label={t("therapistsAdmin.takesSessions")}
          />
          {error && <Alert severity="error">{t("therapistsAdmin.errors.failed")}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t("therapistsAdmin.cancel")}
        </Button>
        <Button variant="contained" onClick={save} loading={saving}>
          {t("therapistsAdmin.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
