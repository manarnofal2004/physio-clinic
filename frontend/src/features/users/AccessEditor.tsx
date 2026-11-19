import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PatientScope, Privilege } from "@shared/api-types";
import { usePatientOptions } from "./api";

// The privileges in groups, the way the admin thinks about them.
const GROUPS: {
  key: "patients" | "reports" | "reservations" | "other";
  privileges: Privilege[];
}[] = [
  { key: "patients", privileges: ["patients.view", "patients.edit"] },
  { key: "reports", privileges: ["reports.view", "reports.edit"] },
  {
    key: "reservations",
    privileges: ["reservations.view", "reservations.take", "reservations.manage"],
  },
  { key: "other", privileges: ["dashboard.view", "banners.manage"] },
];

interface AccessEditorProps {
  privileges: Privilege[];
  scope: PatientScope;
  onPrivilegesChange: (next: Privilege[]) => void;
  onScopeChange: (next: PatientScope) => void;
}

// What a physiotherapist may do (privileges, in groups) and which patients they may see
// (all of them, or a chosen list picked by searching).
export const AccessEditor = ({
  privileges,
  scope,
  onPrivilegesChange,
  onScopeChange,
}: AccessEditorProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const options = usePatientOptions(search);
  // Every patient loaded so far, so chosen ones keep their names while searching.
  const [known, setKnown] = useState<Record<string, string>>({});
  const all = useMemo(() => {
    const next = { ...known };
    (options.data ?? []).forEach((p) => (next[p.id] = p.fullName));
    return next;
  }, [known, options.data]);

  const toggle = (privilege: Privilege) =>
    onPrivilegesChange(
      privileges.includes(privilege)
        ? privileges.filter((p) => p !== privilege)
        : [...privileges, privilege],
    );
  const chosen = scope.all ? [] : scope.patientIds;

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, mb: 1 }}>{t("usersAdmin.privileges")}</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
          mb: 3,
        }}
      >
        {GROUPS.map((group) => (
          <Box key={group.key} sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography variant="body2" sx={{ color: "primary.dark", fontWeight: 700, mb: 0.5 }}>
              {t(`usersAdmin.groups.${group.key}`)}
            </Typography>
            {group.privileges.map((privilege) => (
              <FormControlLabel
                key={privilege}
                sx={{ display: "flex", mx: 0 }}
                control={
                  <Checkbox
                    size="small"
                    checked={privileges.includes(privilege)}
                    onChange={() => toggle(privilege)}
                  />
                }
                label={
                  <Typography variant="body2">{t(`usersAdmin.privilege.${privilege}`)}</Typography>
                }
              />
            ))}
          </Box>
        ))}
      </Box>

      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t("usersAdmin.scope")}</Typography>
      <RadioGroup
        row
        value={scope.all ? "all" : "chosen"}
        onChange={(event) =>
          onScopeChange(
            event.target.value === "all" ? { all: true } : { all: false, patientIds: chosen },
          )
        }
      >
        <FormControlLabel
          value="all"
          control={<Radio size="small" />}
          label={t("usersAdmin.scopeAll")}
        />
        <FormControlLabel
          value="chosen"
          control={<Radio size="small" />}
          label={t("usersAdmin.scopeChosen")}
        />
      </RadioGroup>

      {!scope.all && (
        <Autocomplete
          multiple
          sx={{ mt: 1 }}
          options={(options.data ?? []).map((p) => p.id)}
          value={chosen}
          filterOptions={(ids) => ids}
          getOptionLabel={(id) => all[id] ?? t("usersAdmin.unknownPatient")}
          loading={options.isFetching}
          onInputChange={(_, text, reason) => reason === "input" && setSearch(text)}
          onChange={(_, ids) => {
            setKnown(all);
            onScopeChange({ all: false, patientIds: ids });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("usersAdmin.choosePatients")}
              helperText={t("usersAdmin.choosePatientsHint")}
            />
          )}
        />
      )}
    </Box>
  );
};
