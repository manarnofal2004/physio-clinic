import type { ReactNode } from "react";
import { Box, Button, Pagination, Stack, Typography } from "@mui/material";
import { CalendarPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMyPastReservations, useMyUpcomingReservations } from "./api";
import { ReservationCard } from "./ReservationCard";

// One titled part of the page: "Upcoming" or "Past".
const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box component="section">
    <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

// "My reservations": the patient's coming sessions first (soonest at the top), then
// the past ones (newest first, a page at a time). Each part loads on its own.
export const MyReservationsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  // The page of past reservations lives in the address (?page=2), like My reports.
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const upcoming = useMyUpcomingReservations();
  const past = useMyPastReservations(page);

  let upcomingBody: ReactNode;
  if (upcoming.isPending) {
    upcomingBody = <LoadingState label={t("common.loading")} minHeight={120} />;
  } else if (upcoming.isError) {
    upcomingBody = (
      <ErrorState
        title={t("portal.errors.reservations")}
        retryLabel={t("portal.retry")}
        onRetry={() => void upcoming.refetch()}
      />
    );
  } else if (upcoming.data.length === 0) {
    upcomingBody = (
      <EmptyState
        title={t("portal.reservations.noneUpcoming")}
        description={t("portal.reservations.noneUpcomingHint")}
      />
    );
  } else {
    upcomingBody = (
      <Stack spacing={1.5}>
        {upcoming.data.map((r) => (
          <ReservationCard key={r.id} reservation={r} />
        ))}
      </Stack>
    );
  }

  let pastBody: ReactNode;
  if (past.isPending) {
    pastBody = <LoadingState label={t("common.loading")} minHeight={120} />;
  } else if (past.isError) {
    pastBody = (
      <ErrorState
        title={t("portal.errors.reservations")}
        retryLabel={t("portal.retry")}
        onRetry={() => void past.refetch()}
      />
    );
  } else if (past.data.data.length === 0) {
    pastBody = <EmptyState title={t("portal.reservations.nonePast")} />;
  } else {
    const { data: list, meta } = past.data;
    pastBody = (
      <>
        <Stack spacing={1.5}>
          {list.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </Stack>
        {meta.totalPages > 1 && (
          <Pagination
            count={meta.totalPages}
            page={page}
            onChange={(_, value) => setSearchParams({ page: String(value) })}
            color="primary"
            sx={{ mt: 3, "& ul": { justifyContent: "center" } }}
          />
        )}
      </>
    );
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      <PageHeader
        title={t("portal.reservations.title")}
        subtitle={t("portal.reservations.subtitle")}
        actions={
          <Button
            component={RouterLink}
            to="/#booking"
            variant="contained"
            startIcon={<CalendarPlus size={18} />}
          >
            {t("portal.reservations.book")}
          </Button>
        }
      />
      <Stack spacing={4}>
        <Group title={t("portal.reservations.upcoming")}>{upcomingBody}</Group>
        <Group title={t("portal.reservations.past")}>{pastBody}</Group>
      </Stack>
    </Box>
  );
};
