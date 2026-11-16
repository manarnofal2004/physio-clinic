import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { ExternalLink, PenLine, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { ReportDialog } from "@/features/reports/ReportDialog";
import { useDashboardStats } from "./api";
import { ConditionsChart } from "./ConditionsChart";
import { clinicHour, clinicToday } from "./format";
import { Panel } from "./Panel";
import { ProgressOverview } from "./ProgressOverview";
import { RecentPatients } from "./RecentPatients";
import { ReportsOverTime } from "./ReportsOverTime";
import { StatStrip } from "./StatStrip";

const greeting = (hour: number) => (hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening");

// The staff dashboard (FR-7): the main numbers, three charts, the newest patients
// and quick actions. Admins see it at /admin, physiotherapists with
// "dashboard.view" at /therapist/dashboard; the server counts only their patients.
export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const stats = useDashboardStats();
  const [writing, setWriting] = useState(false);

  const base = pathname.startsWith("/therapist") ? "/therapist" : "/admin";
  const can = (privilege: string) =>
    user?.role === "admin" || Boolean(user?.privileges.some((p) => p === privilege));

  const actions = (
    <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
      {can("reports.edit") && (
        <Button
          variant="contained"
          startIcon={<PenLine size={18} />}
          onClick={() => setWriting(true)}
        >
          {t("dashboard.writeReport")}
        </Button>
      )}
      {can("patients.edit") && (
        <Button
          variant="outlined"
          startIcon={<UserPlus size={18} />}
          component={RouterLink}
          to={`${base}/patients`}
        >
          {t("dashboard.addPatient")}
        </Button>
      )}
      <Button
        startIcon={<ExternalLink size={18} />}
        component="a"
        href="/"
        target="_blank"
        rel="noopener"
      >
        {t("dashboard.visitSite")}
      </Button>
    </Stack>
  );

  let body;
  if (stats.isPending) body = <LoadingState label={t("common.loading")} />;
  else if (stats.isError)
    body = (
      <ErrorState
        title={t("dashboard.error")}
        retryLabel={t("dashboard.retry")}
        onRetry={() => void stats.refetch()}
      />
    );
  else {
    const s = stats.data;
    body = (
      <Stack spacing={3}>
        <StatStrip
          stats={s}
          reservationsPath={can("reservations.view") ? `${base}/reservations` : undefined}
        />
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 7fr) minmax(0, 5fr)" },
          }}
        >
          <Panel
            id="dash-over-time"
            title={t("dashboard.overTime.title")}
            subtitle={t("dashboard.overTime.subtitle", {
              count: s.reportsOverTime.reduce((sum, m) => sum + m.count, 0),
            })}
          >
            <ReportsOverTime data={s.reportsOverTime} />
          </Panel>
          <Panel
            id="dash-progress"
            title={t("dashboard.progress.title")}
            subtitle={t("dashboard.progress.subtitle")}
          >
            <ProgressOverview counts={s.progressCounts} />
          </Panel>
          <Panel id="dash-recent" title={t("dashboard.recent.title")}>
            <RecentPatients patients={s.recentPatients} />
          </Panel>
          <Panel
            id="dash-conditions"
            title={t("dashboard.conditions.title")}
            subtitle={t("dashboard.conditions.subtitle")}
          >
            <ConditionsChart data={s.conditionCounts} />
          </Panel>
        </Box>
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        title={t(`dashboard.greeting.${greeting(clinicHour())}`, { name: user?.fullName })}
        subtitle={clinicToday(i18n.language)}
        actions={actions}
      />
      {body}

      {writing && (
        <ReportDialog
          report={null}
          onClose={() => setWriting(false)}
          onSaved={(r) => {
            setWriting(false);
            notify.success(t("reportsAdmin.saved"));
            navigate(`${base}/reports/${r.id}`);
          }}
        />
      )}
    </Box>
  );
};
