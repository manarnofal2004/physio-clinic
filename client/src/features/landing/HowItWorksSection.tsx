import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type StepKey = keyof Translation["landing"]["how"];

// Each step sits on the spine drawing: `top` is how far down the drawing (in %),
// `x` is where the spine is at that height (in % of the drawing's width, from the
// start side), and `side` says which side of the spine the text goes on.
const steps: { title: StepKey; text: StepKey; top: number; x: number; side: "start" | "end" }[] = [
  { title: "bookTitle", text: "bookText", top: 18, x: 32, side: "start" },
  { title: "confirmTitle", text: "confirmText", top: 50, x: 66, side: "end" },
  { title: "visitTitle", text: "visitText", top: 80, x: 36, side: "start" },
];

// The spine drawing (258 x 1400) shrinks on short screens so the section fits one
// screen; its width follows its height.
const SPINE_HEIGHT = "min(600px, calc(100svh - 300px))";
const SPINE_WIDTH = `calc(${SPINE_HEIGHT} * 258 / 1400)`;
const LINE = 64; // length of the line from the spine to the text

// The three steps hang off a drawn spine in the middle of the section, alternating
// sides. On phones the spine is hidden and the steps stack with a thin line.
export const HowItWorksSection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });

  const marker = (index: number) => (
    <Box
      aria-hidden
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        bgcolor: "warning.main",
        color: "common.white",
        display: "grid",
        placeItems: "center",
        fontSize: "1rem",
        flexShrink: 0,
        boxShadow: (th) => `0 0 0 5px ${th.palette.background.default}`,
      }}
    >
      {number.format(index + 1)}
    </Box>
  );

  const stepText = (step: (typeof steps)[number]) => (
    <>
      <Typography
        variant="h4"
        component="h3"
        sx={{ fontSize: { xs: "1.5rem", md: "1.7rem" }, lineHeight: 1.2 }}
      >
        {t(`landing.how.${step.title}`)}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ mt: 1.25, fontSize: "1rem", lineHeight: 1.75, maxWidth: 330 }}
      >
        {t(`landing.how.${step.text}`)}
      </Typography>
    </>
  );

  return (
    <LandingSection
      id="how-it-works"
      title={t("landing.how.title")}
      intro={t("landing.how.intro")}
      alignTop
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
                transform: "translateY(-20px)",
                display: "flex",
                alignItems: "flex-start",
                flexDirection: atStart ? "row-reverse" : "row",
                // The marker's centre sits on the spine; the text runs away from it.
                ...(atStart
                  ? { insetInlineEnd: `calc(50% - ${offset} - 20px)` }
                  : { insetInlineStart: `calc(50% + ${offset} - 20px)` }),
                width: "calc(50% - 20px)",
              }}
            >
              {marker(index)}
              <Box
                aria-hidden
                sx={{
                  width: LINE,
                  mt: "19px",
                  borderTop: 1.5,
                  borderColor: "warning.main",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ px: 2, mt: "4px", maxWidth: 380 }}>{stepText(step)}</Box>
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
            top: 20,
            bottom: 40,
            insetInlineStart: 19,
            borderInlineStart: "1.5px dashed",
            borderColor: "warning.main",
          },
        }}
      >
        {steps.map((step, index) => (
          <Box
            component="li"
            key={step.title}
            sx={{ display: "flex", gap: 2.5, position: "relative", pb: 4 }}
          >
            {marker(index)}
            <Box>{stepText(step)}</Box>
          </Box>
        ))}
      </Box>
    </LandingSection>
  );
};
