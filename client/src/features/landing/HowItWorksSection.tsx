import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { CalendarDays, PhoneCall, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type StepKey = keyof Translation["landing"]["how"];

// Each step sits on the spine drawing: `top` is how far down the drawing (in %),
// `x` is where the spine is at that height (in % of the drawing's width, from the
// start side), and `side` says which side of the spine the text goes on.
const steps: {
  title: StepKey;
  text: StepKey;
  icon: ReactNode;
  top: number;
  x: number;
  side: "start" | "end";
}[] = [
  { title: "bookTitle", text: "bookText", icon: <CalendarDays />, top: 18, x: 32, side: "start" },
  { title: "confirmTitle", text: "confirmText", icon: <PhoneCall />, top: 50, x: 66, side: "end" },
  { title: "visitTitle", text: "visitText", icon: <Sun />, top: 80, x: 36, side: "start" },
];

// The spine drawing (258 x 1400) shrinks on short screens so the section fits one
// screen; its width follows its height.
const SPINE_HEIGHT = "min(780px, calc(100svh - 215px))";
const SPINE_WIDTH = `calc(${SPINE_HEIGHT} * 258 / 1400)`;
const LINE = 90; // length of the line from the spine to the text
const DOT = 22; // the dot on the spine

// The three steps hang off a drawn spine in the middle of the section, alternating
// sides. On phones the spine is hidden and the steps stack with a thin line.
export const HowItWorksSection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });

  // A small honey dot on the spine.
  const marker = (
    <Box
      aria-hidden
      sx={{
        width: DOT,
        height: DOT,
        borderRadius: "50%",
        bgcolor: "warning.main",
        flexShrink: 0,
        boxShadow: (th) =>
          `0 0 0 4px ${th.palette.background.default}, 0 0 0 5px ${th.palette.warning.main}`,
      }}
    />
  );

  // The step's text: an icon in a pale circle with the step number, the title, then
  // the description.
  const stepText = (step: (typeof steps)[number], index: number) => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          aria-hidden
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "action.selected",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            // Lifted a little so the circle lines up with the number beside it.
            mt: "-6px",
          }}
        >
          {step.icon}
        </Box>
        <Typography aria-hidden sx={{ color: "warning.main", fontSize: "1.5rem", lineHeight: 1 }}>
          {number.format(index + 1)}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        component="h3"
        sx={{
          mt: 1.5,
          fontSize: { xs: "1.8rem", md: "2.4rem" },
          lineHeight: 1.2,
          color: "primary.dark",
          letterSpacing: isRtl ? 0 : "-0.01em",
        }}
      >
        {t(`landing.how.${step.title}`)}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{
          mt: 1.25,
          fontSize: { xs: "1.05rem", md: "1.15rem" },
          lineHeight: 1.7,
          maxWidth: 400,
        }}
      >
        {t(`landing.how.${step.text}`)}
      </Typography>
    </Box>
  );

  return (
    <LandingSection
      id="how-it-works"
      title={t("landing.how.title")}
      intro={t("landing.how.intro")}
      alignTop
      centered
    >
      {/* Wide screens: the spine with the steps around it. */}
      <Box
        component="ol"
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          height: SPINE_HEIGHT,
          m: 0,
          p: 0,
          listStyle: "none",
        }}
      >
        {/* A soft pale olive glow behind the spine, fading into the beige. */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: "-12% 0",
            background: (th) =>
              `radial-gradient(ellipse 38% 55% at 50% 55%, ${th.palette.action.selected} 0%, ${alpha(th.palette.action.selected, 0.6)} 45%, ${alpha(th.palette.action.selected, 0)} 100%)`,
          }}
        />
        <Box
          component="img"
          src="/images/spine.webp"
          alt=""
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            height: SPINE_HEIGHT,
            width: SPINE_WIDTH,
            // Mirrored in Arabic so the steps keep their sides.
            transform: `translateX(-50%)${isRtl ? " scaleX(-1)" : ""}`,
          }}
        />
        {steps.map((step, index) => {
          // Distance of the spine point from the middle of the section.
          const offset = `(${SPINE_WIDTH} * ${(step.x - 50) / 100})`;
          const atStart = step.side === "start";
          return (
            <Box
              component="li"
              key={step.title}
              sx={{
                position: "absolute",
                top: `${step.top}%`,
                transform: `translateY(-${DOT / 2}px)`,
                display: "flex",
                alignItems: "flex-start",
                flexDirection: atStart ? "row-reverse" : "row",
                // The marker's centre sits on the spine; the text runs away from it.
                ...(atStart
                  ? { insetInlineEnd: `calc(50% - ${offset} - ${DOT / 2}px)` }
                  : { insetInlineStart: `calc(50% + ${offset} - ${DOT / 2}px)` }),
                width: `calc(50% - ${DOT / 2}px)`,
              }}
            >
              {marker}
              <Box
                aria-hidden
                sx={{
                  width: LINE,
                  mt: `${DOT / 2}px`,
                  borderTop: 1.5,
                  borderColor: "warning.main",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ px: 2.5, mt: "-4.4rem", maxWidth: 460 }}>{stepText(step, index)}</Box>
            </Box>
          );
        })}
      </Box>

      {/* Phones: the steps one under another, joined by a dashed honey line. */}
      <Box
        component="ol"
        sx={{
          display: { xs: "block", md: "none" },
          m: 0,
          p: 0,
          listStyle: "none",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 60,
            bottom: 60,
            insetInlineStart: DOT / 2 - 1,
            borderInlineStart: "1.5px dashed",
            borderColor: "warning.main",
          },
        }}
      >
        {steps.map((step, index) => (
          <Box
            component="li"
            key={step.title}
            sx={{ display: "flex", gap: 2.5, position: "relative", pt: 4.5, pb: 1 }}
          >
            <Box sx={{ mt: 1.25 }}>{marker}</Box>
            <Box sx={{ flex: 1 }}>{stepText(step, index)}</Box>
          </Box>
        ))}
      </Box>
    </LandingSection>
  );
};
