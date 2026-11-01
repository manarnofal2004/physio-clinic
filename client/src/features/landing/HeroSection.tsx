import { Box, Button, Stack, Typography } from "@mui/material";
import { CalendarDays, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LandingSection } from "./LandingSection";

// Uneven corner radii give the bubble its organic, hand-drawn outline.
const BUBBLE = "58% 42% 50% 50% / 44% 50% 50% 56%";

export const HeroSection = () => {
  const { t } = useTranslation();

  const facts = [
    { icon: <CalendarDays size={20} />, text: t("landing.hero.hours") },
    { icon: <Clock size={20} />, text: t("landing.hero.session") },
  ];

  return (
    <LandingSection id="top">
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <Box sx={{ flex: 1, maxWidth: 680 }}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "2.25rem", md: "3.5rem" }, lineHeight: 1.1 }}
          >
            {t("landing.hero.title")}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 3, fontSize: { xs: "1.0625rem", md: "1.25rem" }, maxWidth: 560 }}
          >
            {t("landing.hero.subtitle")}
          </Typography>

          <Stack direction="row" sx={{ mt: 5, gap: 1.5, flexWrap: "wrap" }}>
            <Button variant="contained" size="large" href="/#booking">
              {t("landing.hero.book")}
            </Button>
            <Button size="large" href="/#how-it-works">
              {t("landing.hero.howItWorks")}
            </Button>
          </Stack>

          <Stack
            component="ul"
            direction={{ xs: "column", sm: "row" }}
            sx={{ mt: 5, p: 0, gap: { xs: 1.5, sm: 4 }, listStyle: "none" }}
          >
            {facts.map((fact) => (
              <Stack
                component="li"
                key={fact.text}
                direction="row"
                sx={{ alignItems: "center", gap: 1, color: "text.secondary" }}
              >
                {fact.icon}
                {fact.text}
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* The illustration sits in a soft "bubble": an organic rounded shape on a
            pale olive layer that peeks out behind it. Hidden on small screens. */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            flexShrink: 0,
            width: { md: 380, lg: 440 },
            position: "relative",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              transform: "translate(-18px, 14px) rotate(-4deg)",
              bgcolor: "action.selected",
              borderRadius: BUBBLE,
            }}
          />
          <Box
            component="img"
            src="/images/hero.webp"
            alt={t("landing.hero.imageAlt")}
            width={960}
            height={1200}
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              height: "auto",
              borderRadius: BUBBLE,
            }}
          />
        </Box>
      </Stack>
    </LandingSection>
  );
};
