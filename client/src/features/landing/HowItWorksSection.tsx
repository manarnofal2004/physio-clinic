import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type StepKey = keyof Translation["landing"]["how"];

const steps: { title: StepKey; text: StepKey }[] = [
  { title: "bookTitle", text: "bookText" },
  { title: "confirmTitle", text: "confirmText" },
  { title: "visitTitle", text: "visitText" },
];

// Three numbered steps on a stone band, in reading order (right to left in Arabic).
export const HowItWorksSection = () => {
  const { t, i18n } = useTranslation();
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });

  return (
    <LandingSection id="how-it-works" title={t("landing.how.title")} tinted>
      <Box
        component="ol"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: { xs: 5, md: 6 },
        }}
      >
        {steps.map((step, index) => (
          <Box component="li" key={step.title}>
            <Typography
              aria-hidden
              sx={{ fontSize: "2.5rem", fontWeight: 500, lineHeight: 1, color: "primary.main" }}
            >
              {number.format(index + 1)}
            </Typography>
            <Typography variant="h5" component="h3" sx={{ mt: 2 }}>
              {t(`landing.how.${step.title}`)}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 340 }}>
              {t(`landing.how.${step.text}`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </LandingSection>
  );
};
