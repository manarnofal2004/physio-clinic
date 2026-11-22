import { Box, Button, Paper, Stack } from "@mui/material";
import { CalendarPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { DayTimeline } from "@/features/availability/DayTimeline";
import { TodayStats } from "@/features/availability/TodayStats";
import { useTodayOverview } from "@/features/booking/hooks";
import { LandingSection } from "./LandingSection";

// Today at the clinic: sessions running now, the day's timeline and how many free
// times are left, with a button down to the booking form. No names or phone
// numbers are shown (the server never sends them).
export const AvailabilitySection = () => {
  const { t } = useTranslation();
  const today = useTodayOverview();

  const bookButton = (
    <Button
      variant="contained"
      href="/#booking"
      startIcon={<CalendarPlus size={18} color="currentColor" />}
    >
      {t("availability.bookCta")}
    </Button>
  );

  let content;
  if (today.isPending) {
    content = <LoadingState label={t("common.loading")} minHeight={160} />;
  } else if (today.isError) {
    content = (
      <ErrorState
        title={t("availability.loadFailed")}
        retryLabel={t("availability.retry")}
        onRetry={() => void today.refetch()}
      />
    );
  } else if (today.data.sessions.length === 0 && today.data.availableSlotsLeft === 0) {
    // A closed day (Friday or Saturday), or a day with nothing booked and nothing left.
    content = (
      <EmptyState
        title={t("availability.closedTitle")}
        description={t("availability.closedHint")}
        action={bookButton}
      />
    );
  } else {
    content = (
      <Stack spacing={3}>
        <TodayStats overview={today.data} />
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: "background.paper" }}
        >
          <DayTimeline overview={today.data} />
        </Paper>
        <Box>{bookButton}</Box>
      </Stack>
    );
  }

  return (
    <LandingSection
      id="availability"
      title={t("availability.title")}
      intro={t("availability.intro")}
      tinted
    >
      {content}
    </LandingSection>
  );
};
