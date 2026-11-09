import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { NAVBAR_HEIGHT, SCREEN_HEIGHT } from "@/components/layout/navbarHeight";

// A section title in dark olive: Redaction italic in English, El Messiri in Arabic
// (Arabic has no italic, so it gets its own elegant face instead).
export const SectionTitle = ({ id, children }: { id: string; children: ReactNode }) => (
  <Typography
    id={id}
    variant="h2"
    sx={{
      color: "primary.dark",
      fontFamily: '"Redaction", "El Messiri", serif',
      fontStyle: "italic",
      "&:lang(ar)": { fontStyle: "normal", fontWeight: 600 },
    }}
  >
    {children}
  </Typography>
);

interface LandingSectionProps {
  id: string; // the navbar links to "/#id"
  title?: string;
  intro?: string;
  tinted?: boolean; // pale olive background, used to separate neighbouring sections
  wash?: boolean; // stone background, the same as the hero
  compact?: boolean; // less space above the heading and between heading and content
  alignTop?: boolean; // keep the heading at the top of the screen instead of centring
  centered?: boolean; // centre the heading
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
      // Short laptop screens: a little less space above and below.
      "@media (min-width: 900px) and (max-height: 700px)": { pt: 1.5, pb: 1.5 },
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
          <SectionTitle id={`${id}-title`}>{title}</SectionTitle>
          {intro && (
            <Typography
              // The intro reads like a quiet line from a book: Redaction italic in
              // English, Amiri in Arabic (Arabic has no italic), in dark honey.
              sx={{
                mt: compact || alignTop ? 0.5 : 2,
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
