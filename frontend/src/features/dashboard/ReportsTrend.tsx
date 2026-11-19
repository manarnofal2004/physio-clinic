import { Box, ToggleButton, ToggleButtonGroup, useTheme } from "@mui/material";
import { LineChart, lineClasses } from "@mui/x-charts/LineChart";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { DashboardStats } from "./api";
import { monthLabel, srOnly } from "./format";

export type Range = 6 | 12;

// The time range beside the chart's title.
export const RangeToggle = ({
  value,
  onChange,
}: {
  value: Range;
  onChange: (r: Range) => void;
}) => {
  const { t } = useTranslation();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, v: Range | null) => v && onChange(v)}
      aria-label={t("dashboard.overTime.range")}
      sx={{
        flexShrink: 0,
        "& .MuiToggleButton-root": { py: 0.25, px: 1.25, whiteSpace: "nowrap" },
      }}
    >
      <ToggleButton value={6}>{t("dashboard.overTime.six")}</ToggleButton>
      <ToggleButton value={12}>{t("dashboard.overTime.twelve")}</ToggleButton>
    </ToggleButtonGroup>
  );
};

// Reports per month as a soft olive curve with a fading fill, over the last 6 or 12
// months. Hovering shows the month and its number; a hidden table repeats the data
// for screen readers.
export const ReportsTrend = ({
  data,
  months,
}: {
  data: DashboardStats["reportsOverTime"];
  months: Range;
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const shown = data.slice(-months);
  const primary = theme.palette.primary.main;

  if (data.every((d) => d.count === 0)) return <EmptyState title={t("dashboard.overTime.empty")} />;

  return (
    <Box sx={{ position: "relative" }}>
      {/* Time runs left to right in both languages. */}
      <Box dir="ltr" sx={{ mx: -1 }}>
        <LineChart
          height={230}
          margin={{ top: 12, right: 24, bottom: 4, left: 4 }}
          hideLegend
          grid={{ horizontal: true }}
          xAxis={[
            {
              scaleType: "point",
              data: shown.map((d) => d.month),
              valueFormatter: (m: string, ctx) =>
                monthLabel(m, i18n.language, ctx.location === "tooltip"),
              tickLabelStyle: { fontSize: 12 },
              // Arabic month names are long: over a year, every other month (always
              // including this one) so they never overlap.
              tickLabelInterval: (_: string, index: number) =>
                months === 6 || i18n.language !== "ar" || (shown.length - 1 - index) % 2 === 0,
              disableLine: true,
              disableTicks: true,
            },
          ]}
          yAxis={[{ width: 28, tickMinStep: 1, disableLine: true, disableTicks: true }]}
          series={[
            {
              data: shown.map((d) => d.count),
              label: t("dashboard.reports"),
              color: primary,
              area: true,
              // Smooth, but never above or below the real numbers.
              curve: "monotoneX",
              showMark: false,
            },
          ]}
          sx={{
            [`& .${lineClasses.area}`]: { fill: "url(#reports-fill)" },
            [`& .${lineClasses.line}`]: { strokeWidth: 2.5 },
            "& .MuiChartsGrid-line": { stroke: theme.palette.divider, strokeDasharray: "3 4" },
          }}
        >
          <defs>
            <linearGradient id="reports-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary} stopOpacity={0.32} />
              <stop offset="100%" stopColor={primary} stopOpacity={0} />
            </linearGradient>
          </defs>
        </LineChart>
      </Box>

      <Box component="table" sx={srOnly}>
        <caption>{t("dashboard.overTime.title")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("dashboard.overTime.month")}</th>
            <th scope="col">{t("dashboard.reports")}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((d) => (
            <tr key={d.month}>
              <th scope="row">{monthLabel(d.month, i18n.language, true)}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
};
