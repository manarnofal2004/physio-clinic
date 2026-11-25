import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { ExternalLink, PenLine, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import type { Privilege } from "@shared/api-types";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { ReportDialog } from "@/features/reports/ReportDialog";
import { useTherapists } from "@/features/therapists/api";
import { useDashboardStats } from "./api";
import { ConditionsChart } from "./ConditionsChart";
import { clinicHour, clinicToday } from "./format";
import { Panel } from "./Panel";
import { ProgressDonut } from "./ProgressDonut";
import { RecentPatients } from "./RecentPatients";
import { RangeToggle, ReportsTrend, type Range } from "./ReportsTrend";
import { ScheduleRail } from "./ScheduleRail";
import { StatCards } from "./StatCards";

const greeting = (hour: number) => (hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening");

// The staff dashboard (FR-7). On the left: four number cards, reports over time,
// how patients are doing, the newest patients and the top conditions. On the right:
// the clinic's calendar with the chosen day's sessions. Admins see it at /admin,
// physiotherapists with "dashboard.view" at /therapist/dashboard; the server counts
// only their patients, and parts that need other privileges are left out.
export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [writing, setWriting] = useState(false);
  const [months, setMonths] = useState<Range>(12);

  const base = pathname.startsWith("/therapist") ? "/therapist" : "/admin";
  const can = (privilege: Privilege) =>
    user?.role === "admin" || Boolean(user?.privileges.includes(privilege));
  const seesSchedule = can("reservations.view");

  const stats = useDashboardStats();
  // Physiotherapists are listed under the reservations privilege.
  const therapists = useTherapists(seesSchedule);

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
  // A failed background refresh keeps the last numbers; the error page shows only when there is nothing to show.
  else if (!stats.data)
    body = (
      <ErrorState
        title={t("dashboard.error")}
        retryLabel={t("dashboard.retry")}
        onRetry={() => void stats.refetch()}
      />
    );
  else {
    const s = stats.data;
    const shownTotal = s.reportsOverTime.slice(-months).reduce((sum, m) => sum + m.count, 0);
    const twoColumns = { xs: "1fr", md: "minmax(0, 3fr) minmax(0, 2fr)" };
    body = (
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          alignItems: "start",
          gridTemplateColumns: { xs: "1fr", lg: seesSchedule ? "minmax(0, 1fr) 320px" : "1fr" },
        }}
      >
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <StatCards
            stats={s}
            therapists={seesSchedule ? therapists.data : undefined}
            reservationsPath={seesSchedule ? `${base}/reservations` : undefined}
          />
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: twoColumns }}>
            <Panel
              id="dash-over-time"
              title={t("dashboard.overTime.title")}
              subtitle={t(`dashboard.overTime.subtitle${months}`, { count: shownTotal })}
              action={<RangeToggle value={months} onChange={setMonths} />}
            >
              <ReportsTrend data={s.reportsOverTime} months={months} />
            </Panel>
            <Panel
              id="dash-progress"
              title={t("dashboard.progress.title")}
              subtitle={t("dashboard.progress.subtitle")}
            >
              <ProgressDonut counts={s.progressCounts} />
            </Panel>
          </Box>
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: twoColumns }}>
            <Panel id="dash-recent" title={t("dashboard.recent.title")}>
              <RecentPatients
                patients={s.recentPatients}
                patientsPath={can("patients.view") ? `${base}/patients` : undefined}
              />
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

        {seesSchedule && (
          // On wide screens the calendar stays in view while the page scrolls.
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 16 } }}>
            <ScheduleRail therapists={therapists.data ?? []} />
          </Box>
        )}
      </Box>
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
