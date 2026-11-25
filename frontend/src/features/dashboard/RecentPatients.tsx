import { Avatar, Box, Link, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDay } from "@/features/reports/format";
import type { DashboardStats } from "./api";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

// The five newest patients with their condition and last visit. Each name opens the
// patient's page when the user may see patients ("patientsPath" is set).
export const RecentPatients = ({
  patients,
  patientsPath,
}: {
  patients: DashboardStats["recentPatients"];
  patientsPath?: string;
}) => {
  const { t, i18n } = useTranslation();

  if (patients.length === 0)
    return (
      <EmptyState
        title={t("dashboard.recent.empty")}
        description={t("dashboard.recent.emptyHint")}
      />
    );

  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {patients.map((p) => (
        <Stack
          component="li"
          key={p.id}
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1.5,
            py: 1.25,
            "& + &": { borderTop: 1, borderColor: "divider" },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: "0.85rem",
              bgcolor: "action.selected",
              color: "primary.dark",
            }}
          >
            {initials(p.fullName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {patientsPath ? (
                <Link
                  component={RouterLink}
                  to={`${patientsPath}/${p.id}`}
                  color="inherit"
                  underline="hover"
                >
                  {p.fullName}
                </Link>
              ) : (
                p.fullName
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {p.condition}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "end", flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary" component="p">
              {t("dashboard.recent.lastVisit")}
            </Typography>
            <Typography variant="body2">
              {p.lastVisit ? formatDay(p.lastVisit, i18n.language) : t("dashboard.recent.noVisit")}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Box>
  );
};
