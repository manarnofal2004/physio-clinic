import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{
      justifyContent: "space-between",
      alignItems: { xs: "flex-start", sm: "center" },
      mb: 3,
    }}
  >
    <Box>
      {/* The same title style as the site's sections: Redaction italic, or El
          Messiri in Arabic. */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: "primary.dark",
          fontSize: { xs: "1.8rem", md: "2.1rem" },
          fontFamily: '"Redaction", "El Messiri", serif',
          fontStyle: "italic",
          "&:lang(ar)": { fontStyle: "normal", fontWeight: 600 },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {actions && (
      <Stack direction="row" spacing={1}>
        {actions}
      </Stack>
    )}
  </Stack>
);
