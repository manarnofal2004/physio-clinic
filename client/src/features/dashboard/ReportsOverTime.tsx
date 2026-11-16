import { Box, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { DashboardStats } from "./api";
import { monthLabel, niceMax, srOnly } from "./format";

const HEIGHT = 180;

// Reports per month for the last 12 months: one olive bar per month on a quiet
// grid, the value in a tooltip, and the same numbers in a table for screen readers.
export const ReportsOverTime = ({ data }: { data: DashboardStats["reportsOverTime"] }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const top = niceMax(Math.max(0, ...data.map((d) => d.count)));

  if (data.every((d) => d.count === 0)) return <EmptyState title={t("dashboard.overTime.empty")} />;

  const latest = data.length - 1;

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        aria-hidden
        sx={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: 1.5 }}
      >
        {/* The scale: the top, the middle and zero. */}
        <Box sx={{ position: "relative", height: HEIGHT, minWidth: 24 }}>
          {[top, top / 2, 0].map((v, i) => (
            <Typography
              key={v}
              variant="caption"
              color="text.secondary"
              sx={{
                position: "absolute",
                insetInlineEnd: 0,
                top: `${i * 50}%`,
                transform: "translateY(-50%)",
                lineHeight: 1,
              }}
            >
              {v}
            </Typography>
          ))}
        </Box>

        <Box sx={{ position: "relative", height: HEIGHT }}>
          {[0, 50].map((p) => (
            <Box
              key={p}
              sx={{
                position: "absolute",
                insetInline: 0,
                top: `${p}%`,
                borderTop: "1px dashed",
                borderColor: "divider",
              }}
            />
          ))}
          <Box
            sx={{
              position: "absolute",
              insetInline: 0,
              bottom: 0,
              borderTop: 1,
              borderColor: "divider",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              gap: "2px",
            }}
          >
            {data.map((d, i) => (
              <Tooltip
                key={d.month}
                placement="top"
                title={`${monthLabel(d.month, lang, true)}: ${d.count}`}
              >
                {/* The whole column answers the hover, not only the bar. */}
                <Box
                  sx={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    "&:hover .bar": { bgcolor: "primary.dark" },
                  }}
                >
                  {/* Only the latest month carries its number. */}
                  {i === latest && (
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {d.count}
                    </Typography>
                  )}
                  <Box
                    className="bar"
                    sx={{
                      width: "min(28px, 70%)",
                      height: `${(d.count / top) * 100}%`,
                      minHeight: d.count ? 2 : 0,
                      bgcolor: "primary.main",
                      borderRadius: "4px 4px 0 0",
                      transition: "background-color 120ms",
                    }}
                  />
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>

        <span />
        <Box sx={{ display: "flex", gap: "2px", mt: 1 }}>
          {data.map((d, i) => (
            <Typography
              key={d.month}
              variant="caption"
              color="text.secondary"
              sx={{
                flex: 1,
                textAlign: "center",
                whiteSpace: "nowrap",
                // Phones have room for every other month only.
                visibility: { xs: i % 2 === latest % 2 ? "visible" : "hidden", sm: "visible" },
              }}
            >
              {monthLabel(d.month, lang)}
            </Typography>
          ))}
        </Box>
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
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{monthLabel(d.month, lang, true)}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
};
