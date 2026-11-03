import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { NAVBAR_HEIGHT, SCREEN_HEIGHT } from "@/components/layout/navbarHeight";

interface LandingSectionProps {
  id: string; // the navbar links to "/#id"
  title?: string;
  intro?: string;
  tinted?: boolean; // pale olive background, used to separate neighbouring sections
  wash?: boolean; // stone background, the same as the hero
  compact?: boolean; // less space above the heading and between heading and content
  children: ReactNode;
}

// Shared frame for landing sections: full-width band, content kept to 1200px.
// Sections are sized so each one fits one screen on a laptop.
export const LandingSection = ({
  id,
  title,
  intro,
  tinted,
  wash,
  compact,
  children,
}: LandingSectionProps) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={title ? `${id}-title` : undefined}
    sx={{
      bgcolor: tinted ? "action.selected" : wash ? "background.wash" : "transparent",
      pt: compact ? { xs: 3, md: 2.5 } : { xs: 6, md: 5 },
      pb: { xs: 6, md: 5 },
      px: { xs: 2, md: 4 },
      scrollMarginTop: NAVBAR_HEIGHT, // stay below the sticky navbar
      // Wide screens: each section fills one screen, its content in the middle.
      minHeight: { md: SCREEN_HEIGHT },
      display: { md: "flex" },
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      {title && (
        <Box sx={{ maxWidth: 640, mb: compact ? 2 : { xs: 4, md: 5 } }}>
          <Typography id={`${id}-title`} variant="h2">
            {title}
          </Typography>
          {intro && (
            <Typography color="text.secondary" sx={{ mt: compact ? 0.5 : 2, fontSize: "1.125rem" }}>
              {intro}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  </Box>
);
