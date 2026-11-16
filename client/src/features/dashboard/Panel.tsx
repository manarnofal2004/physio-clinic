import type { ReactNode } from "react";
import { Paper, Stack, Typography } from "@mui/material";

// One white sheet on the dashboard: a title, an optional line under it, and its
// content.
export const Panel = ({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <Paper
    variant="outlined"
    component="section"
    aria-labelledby={id}
    sx={{ p: { xs: 2, md: 3 }, minWidth: 0, display: "flex", flexDirection: "column" }}
  >
    <Stack sx={{ mb: 2.5 }}>
      <Typography
        id={id}
        component="h2"
        sx={{ fontSize: "1.2rem", fontWeight: 600, color: "primary.dark" }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
    {children}
  </Paper>
);
