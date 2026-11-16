import { Box, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { DashboardStats } from "./api";
import { srOnly } from "./format";

// The most common conditions, largest first: the name, a thin olive bar and the
// number of patients. The server already sends them sorted, at most 10.
export const ConditionsChart = ({ data }: { data: DashboardStats["conditionCounts"] }) => {
  const { t } = useTranslation();

  if (data.length === 0) return <EmptyState title={t("dashboard.conditions.empty")} />;

  const max = Math.max(...data.map((d) => d.count));

  return (
    <Box sx={{ position: "relative" }}>
      <Box aria-hidden sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {data.map((d) => (
          <Tooltip key={d.condition} title={`${d.condition}: ${d.count}`} placement="top">
            {/* One row: the hover covers the label, the bar and the number. Every
                row has the same columns, so the bars line up. */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr) 2.5em",
                alignItems: "center",
                columnGap: 1.5,
                "&:hover .bar": { bgcolor: "primary.dark" },
              }}
            >
              <Typography
                variant="body2"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {d.condition}
              </Typography>
              <Box sx={{ height: 10 }}>
                <Box
                  className="bar"
                  sx={{
                    height: "100%",
                    width: `${(d.count / max) * 100}%`,
                    minWidth: 4,
                    bgcolor: "primary.main",
                    // Rounded at the value's end only; it flips in Arabic.
                    borderStartEndRadius: 4,
                    borderEndEndRadius: 4,
                    transition: "background-color 120ms",
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "end" }}>
                {d.count}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>

      <Box component="table" sx={srOnly}>
        <caption>{t("dashboard.conditions.title")}</caption>
        <thead>
          <tr>
            <th scope="col">{t("dashboard.conditions.condition")}</th>
            <th scope="col">{t("dashboard.patients")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.condition}>
              <th scope="row">{d.condition}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
};
