import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { Pencil, Phone, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { Therapist } from "@shared/api-types";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotify } from "@/components/notifications/useNotify";
import { toInput, useTherapistMutations, useTherapists } from "./api";
import { DAYS, dayName, position } from "./schedule";
import { TherapistDialog } from "./TherapistDialog";

const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((p) => p[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

// One therapist's week: for each clinic day, a track from opening to closing with
// their working hours filled in olive, and the hours written under it.
const WeekStrip = ({ therapist }: { therapist: Therapist }) => {
  const { t, i18n } = useTranslation();
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 1 }}>
      {DAYS.map((day) => {
        const h = therapist.schedule.find((s) => s.day === day);
        return (
          <Box key={day}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: h ? "primary.dark" : "text.disabled" }}
            >
              {dayName(day, i18n.language, "short")}
            </Typography>
            <Box
              sx={{
                position: "relative",
                height: 8,
                my: 0.5,
                borderRadius: 99,
                bgcolor: "action.hover",
              }}
            >
              {h && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    insetInlineStart: `${position(h.start) * 100}%`,
                    width: `${(position(h.end) - position(h.start)) * 100}%`,
                    borderRadius: 99,
                    bgcolor: therapist.isActive ? "primary.main" : "text.disabled",
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              dir="ltr"
              sx={{ display: "block", textAlign: "start" }}
            >
              {h ? `${h.start}–${h.end}` : t("therapistsAdmin.dayOff")}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// The admin's physiotherapists page: each therapist with their specialty, phone,
// login status and working week. Therapists are never deleted: switching off
// "takes new sessions" stops new bookings going to them.
export const TherapistsPage = () => {
  const { t } = useTranslation();
  const notify = useNotify();
  const therapists = useTherapists();
  const { update } = useTherapistMutations();
  const [editing, setEditing] = useState<Therapist | "new" | null>(null);

  let body;
  if (therapists.isPending) body = <LoadingState label={t("common.loading")} />;
  else if (therapists.isError)
    body = (
      <ErrorState
        title={t("therapistsAdmin.errors.load")}
        retryLabel={t("therapistsAdmin.retry")}
        onRetry={() => void therapists.refetch()}
      />
    );
  else if (therapists.data.length === 0)
    body = (
      <EmptyState title={t("therapistsAdmin.empty")} description={t("therapistsAdmin.emptyHint")} />
    );
  else
    body = (
      <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {therapists.data.map((th) => (
          <Box
            component="li"
            key={th.id}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(220px, 1fr) minmax(0, 1.6fr) auto" },
              alignItems: "center",
              gap: { xs: 2, md: 3 },
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              opacity: th.isActive ? 1 : 0.65,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
              <Avatar sx={{ bgcolor: "action.selected", color: "primary.dark", fontWeight: 700 }}>
                {initials(th.fullName)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>{th.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {th.specialty ?? t("therapistsAdmin.noSpecialty")}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 0.75, alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}
                >
                  {th.phone && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      dir="ltr"
                      sx={{ display: "inline-flex", gap: 0.5, alignItems: "center" }}
                    >
                      <Phone size={12} /> {th.phone}
                    </Typography>
                  )}
                  {th.hasAccount ? (
                    <Chip
                      size="small"
                      label={t("therapistsAdmin.hasLogin")}
                      sx={{ bgcolor: "action.selected", color: "primary.dark" }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      clickable
                      component={RouterLink}
                      to="/admin/users"
                      label={t("therapistsAdmin.noLogin")}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            <WeekStrip therapist={th} />

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", justifySelf: { md: "end" } }}
            >
              <Tooltip title={t("therapistsAdmin.takesSessions")}>
                <Switch
                  checked={th.isActive}
                  slotProps={{ input: { "aria-label": t("therapistsAdmin.takesSessions") } }}
                  onChange={(e) =>
                    update.mutate(
                      { id: th.id, input: { ...toInput(th), isActive: e.target.checked } },
                      {
                        onSuccess: () => notify.success(t("therapistsAdmin.saved")),
                        onError: () => notify.error(t("therapistsAdmin.errors.failed")),
                      },
                    )
                  }
                />
              </Tooltip>
              <Tooltip title={t("therapistsAdmin.edit")}>
                <IconButton aria-label={t("therapistsAdmin.edit")} onClick={() => setEditing(th)}>
                  <Pencil size={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}
      </Stack>
    );

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title={t("therapistsAdmin.title")}
        subtitle={t("therapistsAdmin.subtitle")}
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setEditing("new")}
          >
            {t("therapistsAdmin.add")}
          </Button>
        }
      />
      {body}
      {editing && (
        <TherapistDialog
          key={editing === "new" ? "new" : editing.id}
          therapist={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            notify.success(t("therapistsAdmin.saved"));
          }}
        />
      )}
    </Box>
  );
};
