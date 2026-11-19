import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PatientScope, Privilege } from "@shared/api-types";
import { ApiError } from "@/lib/api/apiError";
import { AccessEditor } from "./AccessEditor";
import { usePatientOptions, useTherapistOptions, useUserMutations } from "./api";

type NewRole = "therapist" | "patient";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create a login for a physiotherapist or a patient. The account is linked to an
// existing therapist profile or patient record (only those without an account are
// offered), and a therapist also gets privileges and a patient scope.
export const CreateUserDialog = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) => {
  const { t } = useTranslation();
  const { create } = useUserMutations();
  const therapists = useTherapistOptions();
  const [patientSearch, setPatientSearch] = useState("");
  const patients = usePatientOptions(patientSearch);

  const [role, setRole] = useState<NewRole>("therapist");
  const [linkId, setLinkId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privileges, setPrivileges] = useState<Privilege[]>(["patients.view", "reports.view"]);
  const [scope, setScope] = useState<PatientScope>({ all: true });
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const therapistChoices = (therapists.data ?? []).filter((x) => !x.hasAccount);
  const patientChoices = (patients.data ?? []).filter((x) => !x.hasAccount);

  const errors = {
    link: !linkId,
    fullName: fullName.trim().length < 2 || fullName.trim().length > 120,
    email: !EMAIL.test(email.trim()),
    password: password.length < 8,
  };
  const invalid = Object.values(errors).some(Boolean);

  const save = () => {
    setTried(true);
    setError(null);
    if (invalid || !linkId) return;
    const base = { fullName: fullName.trim(), email: email.trim(), password };
    create.mutate(
      role === "therapist"
        ? { ...base, role, therapistId: linkId, privileges, patientScope: scope }
        : { ...base, role, patientId: linkId },
      {
        onSuccess: onCreated,
        onError: (err) => {
          const code = err instanceof ApiError ? err.code : null;
          setError(
            t(
              code === "CONFLICT"
                ? "usersAdmin.errors.conflict"
                : code === "VALIDATION_ERROR"
                  ? "usersAdmin.errors.check"
                  : "usersAdmin.errors.failed",
            ),
          );
        },
      },
    );
  };

  return (
    <Dialog open onClose={create.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("usersAdmin.add")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={role}
            onChange={(_, next: NewRole | null) => {
              if (!next) return;
              setRole(next);
              setLinkId(null);
              setFullName("");
            }}
            sx={{ "& .MuiToggleButton-root": { px: 2.5, textTransform: "none" } }}
          >
            <ToggleButton value="therapist">{t("roles.therapist")}</ToggleButton>
            <ToggleButton value="patient">{t("roles.patient")}</ToggleButton>
          </ToggleButtonGroup>

          {/* Which profile this login belongs to; its name fills the name field. */}
          {role === "therapist" ? (
            <Autocomplete
              options={therapistChoices}
              getOptionLabel={(x) => x.fullName}
              value={therapistChoices.find((x) => x.id === linkId) ?? null}
              onChange={(_, x) => {
                setLinkId(x?.id ?? null);
                if (x) setFullName(x.fullName);
              }}
              noOptionsText={t("usersAdmin.noTherapists")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("usersAdmin.therapistProfile")}
                  error={tried && errors.link}
                  helperText={tried && errors.link ? t("usersAdmin.errors.link") : undefined}
                />
              )}
            />
          ) : (
            <Autocomplete
              options={patientChoices}
              getOptionLabel={(x) => `${x.fullName} · ${x.phone}`}
              filterOptions={(x) => x}
              value={patientChoices.find((x) => x.id === linkId) ?? null}
              onInputChange={(_, text, reason) => reason === "input" && setPatientSearch(text)}
              onChange={(_, x) => {
                setLinkId(x?.id ?? null);
                if (x) setFullName(x.fullName);
              }}
              noOptionsText={t("usersAdmin.noPatients")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("usersAdmin.patientRecord")}
                  error={tried && errors.link}
                  helperText={tried && errors.link ? t("usersAdmin.errors.link") : undefined}
                />
              )}
            />
          )}

          <TextField
            label={t("usersAdmin.fullName")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={tried && errors.fullName}
            helperText={tried && errors.fullName ? t("usersAdmin.errors.fullName") : undefined}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label={t("usersAdmin.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={tried && errors.email}
              helperText={tried && errors.email ? t("usersAdmin.errors.email") : undefined}
              slotProps={{ htmlInput: { dir: "ltr" } }}
            />
            <TextField
              fullWidth
              label={t("usersAdmin.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={tried && errors.password}
              helperText={
                tried && errors.password
                  ? t("usersAdmin.errors.password")
                  : t("usersAdmin.passwordHint")
              }
              slotProps={{ htmlInput: { dir: "ltr" } }}
            />
          </Stack>

          {role === "therapist" && (
            <AccessEditor
              privileges={privileges}
              scope={scope}
              onPrivilegesChange={setPrivileges}
              onScopeChange={setScope}
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={create.isPending}>
          {t("usersAdmin.cancel")}
        </Button>
        <Button variant="contained" onClick={save} loading={create.isPending}>
          {t("usersAdmin.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
