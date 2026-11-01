import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { NAVBAR_HEIGHT } from "@/components/layout/navbarHeight";

interface LandingSectionProps {
  id: string; // the navbar links to "/#id"
  title?: string;
  intro?: string;
  tinted?: boolean; // pale olive background, used to separate neighbouring sections
  wash?: boolean; // stone background, the same as the hero
  children: ReactNode;
}

// Shared frame for landing sections: full-width band, content kept to 1200px.
export const LandingSection = ({
  id,
  title,
  intro,
  tinted,
  wash,
  children,
}: LandingSectionProps) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={title ? `${id}-title` : undefined}
    sx={{
      bgcolor: tinted ? "action.selected" : wash ? "background.wash" : "transparent",
      py: { xs: 7, md: 11 },
      px: { xs: 2, md: 4 },
      scrollMarginTop: NAVBAR_HEIGHT, // stay below the sticky navbar
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
