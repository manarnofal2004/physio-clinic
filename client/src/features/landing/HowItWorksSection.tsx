import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type StepKey = keyof Translation["landing"]["how"];

// A small white "scene" showing what the step looks like for the visitor.
const Scene = ({ children }: { children: ReactNode }) => (
  <Box
    aria-hidden
    sx={{
      mt: 3,
      height: 150,
      borderRadius: 4,
      bgcolor: "background.paper",
      p: 2.5,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    {children}
  </Box>
);

// Step 1: a day with its free times, one of them picked.
const PickScene = () => {
  const { t } = useTranslation();
  return (
    <Scene>
      <Typography variant="body2" color="text.secondary">
        {t("landing.how.day")}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }} dir="ltr">
        {["09:00", "09:45", "10:30"].map((time) => {
          const picked = time === "09:45";
          return (
            <Box
              key={time}
              sx={{
                px: 1.75,
                py: 0.75,
                borderRadius: 999,
                fontSize: "0.95rem",
                border: 1,
                borderColor: picked ? "primary.main" : "divider",
                bgcolor: picked ? "primary.main" : "transparent",
                color: picked ? "primary.contrastText" : "text.primary",
              }}
            >
              {time}
            </Box>
          );
        })}
      </Box>
    </Scene>
  );
};

// Step 2: the clinic's confirmation message.
const ConfirmScene = () => {
  const { t } = useTranslation();
  return (
    <Scene>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Check size={14} strokeWidth={2.5} color="currentColor" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t("landing.how.from")}
        </Typography>
      </Box>
      <Box
        sx={{
          mt: 1.25,
          px: 2,
          py: 1.25,
          borderRadius: 3,
          borderStartStartRadius: 4,
          bgcolor: "action.selected",
          fontSize: "0.95rem",
          lineHeight: 1.5,
        }}
      >
        {t("landing.how.message")}
      </Box>
    </Scene>
  );
};

// Step 3: a 45-minute ring, three quarters of an hour.
const SessionScene = () => {
  const { t } = useTranslation();
  const r = 36;
  const length = 2 * Math.PI * r;
  return (
    <Scene>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box component="svg" viewBox="0 0 88 88" sx={{ width: 88, height: 88, flexShrink: 0 }}>
          <Box
            component="circle"
            cx={44}
            cy={44}
            r={r}
            fill="none"
            strokeWidth={6}
            sx={{ stroke: (th) => th.palette.action.selected }}
          />
          <Box
            component="circle"
            cx={44}
            cy={44}
            r={r}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${length * 0.75} ${length}`}
            transform="rotate(-90 44 44)"
            sx={{ stroke: (th) => th.palette.warning.main }}
          />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "2rem", lineHeight: 1, color: "primary.main" }}>
            45{" "}
            <Box component="span" sx={{ fontSize: "1rem" }}>
              {t("landing.how.minutes")}
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {t("landing.how.oneToOne")}
          </Typography>
        </Box>
      </Box>
    </Scene>
  );
};

const steps: { title: StepKey; text: StepKey; scene: ReactNode }[] = [
  { title: "bookTitle", text: "bookText", scene: <PickScene /> },
  { title: "confirmTitle", text: "confirmText", scene: <ConfirmScene /> },
  { title: "visitTitle", text: "visitText", scene: <SessionScene /> },
];

// Three steps joined by a dotted honey path, each with a small scene of what the
// visitor will see: picking a time, the confirmation, the session itself.
export const HowItWorksSection = () => {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language);

  return (
    <LandingSection id="how-it-works" title={t("landing.how.title")} tinted>
      <Box
        component="ol"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          position: "relative",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: { xs: 5, md: 5 },
          // The path that joins the three numbers on wide screens.
          "&::before": {
            content: '""',
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 23,
            insetInline: "48px 33%",
            borderTop: "2px dashed",
            borderColor: "warning.main",
            opacity: 0.6,
          },
        }}
      >
        {steps.map((step, index) => (
          <Box component="li" key={step.title} sx={{ position: "relative" }}>
            <Box
              aria-hidden
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
                fontSize: "1.3rem",
                position: "relative",
                // A ring in the band colour so the dashed path stops short of the circle.
                boxShadow: (th) => `0 0 0 6px ${th.palette.action.selected}`,
              }}
            >
              {number.format(index + 1)}
            </Box>
            <Typography variant="h5" component="h3" sx={{ mt: 2.5 }}>
              {t(`landing.how.${step.title}`)}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 340 }}>
              {t(`landing.how.${step.text}`)}
            </Typography>
            {step.scene}
          </Box>
        ))}
      </Box>
    </LandingSection>
  );
};
