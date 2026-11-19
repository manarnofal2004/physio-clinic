import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { SCREEN_HEIGHT } from "@/components/layout/navbarHeight";
import { WaveClipPath } from "./wave";

// The photo fills the far half of the hero, with a wave on the edge facing the text.

export const HeroSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const details = [
    { label: t("landing.hero.hoursLabel"), value: t("landing.hero.hours") },
    { label: t("landing.hero.sessionLabel"), value: t("landing.hero.session") },
  ];

  return (
    <Box
      component="section"
      id="top"
      sx={{ position: "relative", overflow: "hidden", bgcolor: "background.wash" }}
    >
      <WaveClipPath id="hero-wave" isRtl={isRtl} />

      {/* Photo with a pale olive band following the wave just outside it. */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          top: 0,
          bottom: 0,
          insetInlineEnd: 0,
          width: "52%",
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
            // Keep the therapist (left of the photo) clear of the wave in both directions.
            objectPosition: isRtl ? "35% 50%" : "20% 50%",
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
          // More space below than above on wide screens, so the text sits a
          // little higher than the middle of the screen.
          pt: { xs: 7, md: 4 },
          pb: { xs: 7, md: 14 },
          // Short laptop screens: less space around the text so it fits one screen.
          "@media (min-width: 900px) and (max-height: 700px)": {
            pt: 2,
            pb: 6,
            "& .hero-details": { mt: 4 },
            "& .hero-actions": { mt: 3 },
          },
          // Leaves room for the announcement bar above the navbar while it shows.
          minHeight: { md: `calc(${SCREEN_HEIGHT} - var(--banner-height, 0px))` },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: { md: "44%" } }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.6rem", md: "3.4rem" } }}>
            {t("landing.hero.title")}{" "}
            {/* Second line in italic. Arabic has no true italic (a slanted Arabic
                font looks broken), so there it stays upright. */}
            <Box component="em" sx={{ display: "block", fontStyle: isRtl ? "normal" : "italic" }}>
              {t("landing.hero.titleEmphasis")}
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: 3,
              fontSize: { xs: "1.15rem", md: "1.2rem" },
              lineHeight: 1.7,
              maxWidth: "34em",
            }}
          >
            {t("landing.hero.subtitle")}
          </Typography>

          <Stack className="hero-actions" direction="row" sx={{ mt: 5, gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" size="large" href="/#booking" sx={{ px: 3.5, py: 1.25 }}>
              {t("landing.hero.book")}
            </Button>
            <Button size="large" href="/#how-it-works" sx={{ px: 2.5, py: 1.25 }}>
              {t("landing.hero.howItWorks")}
            </Button>
          </Stack>

          {/* Practical details a visitor checks before booking, as a small
              label/value list under a thin line. */}
          <Box
            component="dl"
            className="hero-details"
            sx={{
              mt: { xs: 6, md: 8 },
              mb: 0,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: { sm: "auto auto" },
              justifyContent: "start",
              rowGap: 3,
              columnGap: 6,
            }}
          >
            {details.map((detail) => (
              <div key={detail.label}>
                <Typography component="dt" color="text.secondary" sx={{ fontSize: "0.95rem" }}>
                  {detail.label}
                </Typography>
                <Typography
                  component="dd"
                  sx={{ m: 0, mt: 0.5, fontWeight: 500, fontSize: "1.1rem" }}
                >
                  {detail.value}
                </Typography>
              </div>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
