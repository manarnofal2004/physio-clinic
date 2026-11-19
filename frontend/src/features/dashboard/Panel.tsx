import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

// One white card on the dashboard: a title, an optional line under it, an optional
// control beside them (such as a time range), and its content.
export const Panel = ({
  id,
  title,
  subtitle,
  action,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <Paper
    variant="outlined"
    component="section"
    aria-labelledby={id}
    sx={{ p: { xs: 2, md: 2.5 }, minWidth: 0, display: "flex", flexDirection: "column" }}
  >
    <Stack
      direction="row"
      sx={{
        mb: 2,
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1.5,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography
          id={id}
          component="h2"
          sx={{ fontSize: "1.15rem", fontWeight: 600, color: "primary.dark" }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
    {children}
  </Paper>
);
