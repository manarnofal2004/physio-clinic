import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { TodayOverview } from "@shared/api-types";
import { clinicMinutes, clinicTime } from "./clinicTime";

type Session = TodayOverview["sessions"][number];
type SessionState = Session["state"];

// The clinic day on the timeline, 08:00 to 19:00, in minutes since midnight.
const DAY_START = 8 * 60;
const DAY_END = 19 * 60;
const DAY_LENGTH = DAY_END - DAY_START;

const LANE_HEIGHT = 14; // px, one row of sessions
const LANE_GAP = 4; // px between rows

const STATES: SessionState[] = ["done", "running", "upcoming"];

const stateColor: Record<SessionState, string> = {
  done: "action.disabled",
  running: "primary.main",
  upcoming: "warning.main",
};

// A moment as a percentage along the day, kept between 0 and 100.
const percentOf = (iso: string) => {
  const minutes = clinicMinutes(iso) - DAY_START;
  return Math.min(100, Math.max(0, (minutes / DAY_LENGTH) * 100));
};

// Several therapists can have sessions at the same time, so sessions that overlap
// go on separate rows ("lanes"): each one takes the first row that is free by its start.
const toLanes = (sessions: Session[]) => {
  const laneEnds: string[] = []; // when the last session on each row ends
  return sessions.map((session) => {
    let lane = laneEnds.findIndex((end) => end <= session.startsAt);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = session.endsAt;
    return { session, lane };
  });
};

// Today's sessions as coloured blocks on a bar from 08:00 to 19:00, with a line
// for the current time and a legend. In Arabic the bar runs from right to left.
export const DayTimeline = ({ overview }: { overview: TodayOverview }) => {
  const { t } = useTranslation();
  const placed = toLanes(overview.sessions);
  const lanes = Math.max(1, ...placed.map((item) => item.lane + 1));
  const height = lanes * LANE_HEIGHT + (lanes - 1) * LANE_GAP;
  const now = percentOf(overview.now);
  const showNow = now > 0 && now < 100;

  return (
    <Box>
      <Box
        role="img"
        aria-label={t("availability.timelineLabel")}
        sx={{ position: "relative", height, borderRadius: 1, bgcolor: "action.hover" }}
      >
        {placed.map(({ session, lane }) => {
          const start = percentOf(session.startsAt);
          const end = percentOf(session.endsAt);
          return (
            <Box
              key={`${session.startsAt}-${lane}`}
              title={`${clinicTime(session.startsAt)} - ${clinicTime(session.endsAt)}`}
              sx={{
                position: "absolute",
                top: lane * (LANE_HEIGHT + LANE_GAP),
                height: LANE_HEIGHT,
                insetInlineStart: `${start}%`,
                width: `${end - start}%`,
                borderRadius: 1,
                bgcolor: stateColor[session.state],
              }}
            />
          );
        })}
        {showNow && (
          <Box
            sx={{
              position: "absolute",
              top: -4,
              bottom: -4,
              insetInlineStart: `${now}%`,
              width: 2,
              bgcolor: "text.primary",
            }}
          />
        )}
      </Box>

      {/* The day's first and last hour under the bar. */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          <bdi dir="ltr">08:00</bdi>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <bdi dir="ltr">19:00</bdi>
        </Typography>
      </Box>

      {/* What each colour means. */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
        {STATES.map((state) => (
          <Box key={state} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: stateColor[state] }} />
            <Typography variant="body2" color="text.secondary">
              {t(`availability.states.${state}`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
