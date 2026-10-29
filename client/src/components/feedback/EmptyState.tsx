import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <Stack spacing={1.5} sx={{ alignItems: "center", py: 6, px: 2, textAlign: "center" }}>
    {icon}
    <Typography variant="h6" component="p">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
    {action}
  </Stack>
);
