import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CalendarDays, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

// The photo fills the far half of the hero. Its edge facing the text is a soft
// S-shaped wave, drawn as an SVG clip path in 0..1 units so it scales with the box.
// Arabic needs the mirror image (wave on the other side), so x becomes 1 - x.
const WAVE_LTR = "M0.2,0 C0.04,0.16 0.03,0.36 0.13,0.52 C0.23,0.68 0.2,0.86 0.07,1 L1,1 L1,0 Z";
const WAVE_RTL = "M0.8,0 C0.96,0.16 0.97,0.36 0.87,0.52 C0.77,0.68 0.8,0.86 0.93,1 L0,1 L0,0 Z";

export const HeroSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const wave = theme.direction === "rtl" ? WAVE_RTL : WAVE_LTR;

  const facts = [
    { icon: <CalendarDays size={20} />, text: t("landing.hero.hours") },
    { icon: <Clock size={20} />, text: t("landing.hero.session") },
  ];

  return (
    <Box
      component="section"
      id="top"
      sx={{ position: "relative", overflow: "hidden", minHeight: { md: 580 } }}
    >
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <clipPath id="hero-wave" clipPathUnits="objectBoundingBox">
          <path d={wave} />
        </clipPath>
      </svg>

      {/* Photo with a pale olive band following the wave just outside it. */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          top: 0,
          bottom: 0,
          insetInlineEnd: 0,
          width: "50%",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            insetInlineEnd: 0,
            width: "calc(100% + 28px)",
            bgcolor: "action.selected",
            clipPath: "url(#hero-wave)",
          }}
        />
        <Box
          component="img"
          src="/images/hero.webp"
          alt={t("landing.hero.imageAlt")}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            clipPath: "url(#hero-wave)",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 12 },
        }}
      >
        <Box sx={{ maxWidth: { md: "46%" } }}>
          <Typography
            variant="h1"
            sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" }, lineHeight: 1.1 }}
          >
            {t("landing.hero.title")}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 3, fontSize: { xs: "1.0625rem", md: "1.2rem" } }}
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
      </Box>
    </Box>
  );
};
