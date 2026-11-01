import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface LandingSectionProps {
  id: string; // the navbar links to "/#id"
  title?: string;
  intro?: string;
  tinted?: boolean; // stone background, used to separate neighbouring sections
  children: ReactNode;
}

// Shared frame for landing sections: full-width band, content kept to 1200px.
export const LandingSection = ({ id, title, intro, tinted, children }: LandingSectionProps) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={title ? `${id}-title` : undefined}
    sx={{
      bgcolor: tinted ? "action.selected" : "transparent",
      py: { xs: 7, md: 11 },
      px: { xs: 2, md: 4 },
      scrollMarginTop: { xs: 64, md: 72 }, // stay below the sticky navbar
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {title && (
        <Box sx={{ maxWidth: 640, mb: { xs: 5, md: 7 } }}>
          <Typography id={`${id}-title`} variant="h2">
            {title}
          </Typography>
          {intro && (
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: "1.125rem" }}>
              {intro}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  </Box>
);
