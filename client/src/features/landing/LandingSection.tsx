import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { NAVBAR_HEIGHT, SCREEN_HEIGHT } from "@/components/layout/navbarHeight";
import { Scribble } from "./Scribble";

// A section title: large, in dark olive, with the honey hand-drawn line under it.
export const SectionTitle = ({
  id,
  centered,
  children,
}: {
  id: string;
  centered?: boolean;
  children: ReactNode;
}) => (
  <Box>
    <Typography
      id={id}
      variant="h2"
      sx={{ color: "primary.dark", fontSize: { xs: "2.2rem", md: "2.75rem" } }}
    >
      {children}
    </Typography>
    <Scribble sx={{ mt: 0.75, width: 120, ...(centered && { mx: "auto" }) }} />
  </Box>
);

interface LandingSectionProps {
  id: string; // the navbar links to "/#id"
  title?: string;
  intro?: string;
  tinted?: boolean; // pale olive background, used to separate neighbouring sections
  wash?: boolean; // stone background, the same as the hero
  compact?: boolean; // less space above the heading and between heading and content
  alignTop?: boolean; // keep the heading at the top of the screen instead of centring
  centered?: boolean; // centre the heading and its line
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
  alignTop,
  centered,
  children,
}: LandingSectionProps) => (
  <Box
    component="section"
    id={id}
    aria-labelledby={title ? `${id}-title` : undefined}
    sx={{
      bgcolor: tinted ? "action.selected" : wash ? "background.wash" : "transparent",
      pt: compact || alignTop ? { xs: 3, md: 2.5 } : { xs: 6, md: 5 },
      pb: alignTop ? { xs: 6, md: 2 } : { xs: 6, md: 5 },
      px: { xs: 2, md: 4 },
      scrollMarginTop: NAVBAR_HEIGHT, // stay below the sticky navbar
      overflowX: "clip", // shapes that run to the screen edges never cause sideways scrolling
      // Wide screens: each section fills one screen, its content in the middle.
      minHeight: { md: SCREEN_HEIGHT },
      display: { md: "flex" },
      flexDirection: "column",
      justifyContent: alignTop ? "flex-start" : "center",
    }}
  >
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      {title && (
        <Box
          sx={{
            maxWidth: 640,
            mb: compact || alignTop ? 2 : { xs: 4, md: 5 },
            ...(centered && { mx: "auto", textAlign: "center" }),
          }}
        >
          <SectionTitle id={`${id}-title`} centered={centered}>
            {title}
          </SectionTitle>
          {intro && (
            <Typography
              // The intro reads like a quiet line from a book: Redaction italic in
              // English, Amiri in Arabic (Arabic has no italic), in dark honey.
              sx={{
                mt: compact || alignTop ? 1 : 2,
                fontFamily: '"Redaction", "Amiri", serif',
                fontStyle: "italic",
                fontSize: { xs: "1.2rem", md: "1.3rem" },
                lineHeight: 1.5,
                color: "warning.dark",
                "&:lang(ar)": { fontStyle: "normal", fontSize: { xs: "1.3rem", md: "1.4rem" } },
              }}
            >
              {intro}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  </Box>
);
