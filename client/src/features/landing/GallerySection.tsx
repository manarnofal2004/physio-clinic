import { useEffect, useState } from "react";
import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";
import { Scribble } from "./Scribble";

type PhotoKey = "reception" | "treatment" | "handsOn" | "exercise" | "waiting";
type GalleryKey = keyof Translation["landing"]["gallery"];

// All photos are wide (3:2), so the large frame shows each one whole. "?v=2" makes
// browsers fetch the new versions instead of the copies they kept.
const photos: { key: PhotoKey; src: string }[] = [
  { key: "reception", src: "/images/gallery/reception.webp?v=2" },
  { key: "treatment", src: "/images/gallery/treatment.webp?v=2" },
  { key: "handsOn", src: "/images/gallery/hands-on.webp?v=2" },
  { key: "exercise", src: "/images/gallery/exercise.webp?v=2" },
  { key: "waiting", src: "/images/gallery/waiting.webp?v=2" },
];

const AUTO_MS = 5000; // the photos move on by themselves every 5 seconds

// Height of the large photo on wide screens: the screen minus the heading above.
const FEATURE_HEIGHT = "calc(100svh - 236px)";
// The sheet is as tall as the large photo and takes the rest of the width. Its name,
// sentence, captions, arrows and padding take about SHEET_TEXT, so the large photo
// leaves the sheet that much more width than half, and the small photos keep about 3:2.
const SHEET_TEXT = "364px";
const GAP = "32px";
const MAT = 12; // width of the cream mat around the large photo
const COLUMNS = `minmax(0, 1fr) min(calc((${FEATURE_HEIGHT} - ${MAT * 2}px) * 1.5 + ${MAT * 2}px), calc((100% - ${GAP} + ${SHEET_TEXT}) / 2))`;
// On short laptop screens the sheet is wide and low, so the small photos go in one row.
const SHORT = "@media (min-width: 900px) and (max-height: 760px)";

// Handwriting for the captions: Caveat for Latin, Aref Ruqaa for Arabic.
const HAND = '"Caveat", "Aref Ruqaa", cursive';

// One large photo, and beside it a sheet of paper with torn edges: the place's name
// with a hand-drawn line under it and a sentence about it, the other photos glued on
// with handwritten names, and arrows. The photos change by themselves every few
// seconds.
export const GallerySection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const number = new Intl.NumberFormat(i18n.language);
  const isRtl = theme.direction === "rtl";
  const [active, setActive] = useState(0);
  const photo = photos[active] ?? photos[0]!;
  const others = photos.filter((_, index) => index !== active);
  const text = (key: string) => t(`landing.gallery.${key as GalleryKey}`);

  const go = (step: 1 | -1) => setActive((a) => (a + step + photos.length) % photos.length);

  // The photos change by themselves, but stay put while the visitor's pointer or
  // keyboard focus is on the gallery, and never for people who asked for less motion.
  const [paused, setPaused] = useState(false);
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setTimeout(() => go(1), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, reduceMotion]);

  // Arrows point the way the photos move: in Arabic "next" is to the left.
  const Prev = isRtl ? ArrowRight : ArrowLeft;
  const Next = isRtl ? ArrowLeft : ArrowRight;
  // Round pale olive bubbles that fill with olive on hover.
  const arrow = {
    width: 40,
    height: 40,
    bgcolor: "action.selected",
    color: "primary.dark",
    transition: "background-color 150ms, color 150ms",
    "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" },
    "&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
  };

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
      alignTop
    >
      <Box
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: COLUMNS },
          gap: { xs: 3, md: GAP },
          "@keyframes galleryFade": { from: { opacity: 0.4 }, to: { opacity: 1 } },
        }}
      >
        {/* The sheet of paper, with a soft shadow that follows its torn edges. */}
        <Box
          sx={{
            order: { xs: 2, md: 0 },
            filter: "drop-shadow(0 10px 18px rgba(60, 50, 20, 0.18))",
          }}
        >
          <Box
            sx={{
              height: "100%",
              boxSizing: "border-box",
              // A photo of real torn paper stretched to the sheet: cream in light
              // mode, a dark olive stone version of the same sheet in dark mode.
              // Separate properties: the RTL plugin garbles the shorthand.
              backgroundImage: `url(/images/${theme.palette.mode === "light" ? "paper" : "paper-dark"}.webp)`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 3.5, md: 4 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box aria-live="polite">
              <Typography
                variant="h3"
                component="h3"
                sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" }, color: "primary.dark" }}
              >
                {text(photo.key)}
              </Typography>
              <Scribble sx={{ mt: 0.25 }} />
              <Typography color="text.secondary" sx={{ mt: 1.25, fontSize: "1.05rem" }}>
                {text(`${photo.key}Text`)}
              </Typography>
            </Box>

            {/* The other photos in a tidy two-by-two grid that fills the rest of
                the sheet, each with its name written under it. */}
            <Box
              role="list"
              aria-label={t("landing.gallery.photos")}
              sx={{
                flex: { md: 1 },
                minHeight: 0,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: { md: "minmax(0, 1fr) minmax(0, 1fr)" },
                gap: { xs: 1.5, md: 2 },
                [SHORT]: {
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gridTemplateRows: "minmax(0, 1fr)",
                },
              }}
            >
              {others.map((item) => (
                <ButtonBase
                  key={item.key}
                  role="listitem"
                  onClick={() => setActive(photos.indexOf(item))}
                  aria-label={`${t("landing.gallery.open")}: ${text(item.key)}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    minHeight: 0,
                    transition: "transform 200ms ease-out",
                    "&:hover": { transform: "translateY(-3px)" },
                    "&:focus-visible": {
                      outline: 2,
                      outlineColor: "primary.main",
                      outlineOffset: 3,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={item.src}
                    alt=""
                    loading="lazy"
                    sx={{
                      display: "block",
                      width: "100%",
                      // Phones: 3:2. Wide screens: whatever the grid cell leaves.
                      aspectRatio: { xs: "3 / 2", md: "auto" },
                      flex: { md: 1 },
                      minHeight: 0,
                      boxSizing: "border-box",
                      objectFit: "cover",
                      border: "4px solid",
                      // White print borders; a soft cream at night so they don't glare.
                      borderColor: theme.palette.mode === "light" ? "background.paper" : "#d9d1bf",
                      boxShadow: "0 3px 8px rgba(60, 50, 20, 0.18)",
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      mt: 0.5,
                      fontFamily: HAND,
                      fontSize: "1.15rem",
                      lineHeight: 1.2,
                      color: "warning.dark",
                      textAlign: "center",
                    }}
                  >
                    {text(item.key)}
                  </Box>
                </ButtonBase>
              ))}
            </Box>

            {/* The arrows with the photo's number between them, written by hand. */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: -1 }}>
              <IconButton
                onClick={() => go(-1)}
                aria-label={t("landing.gallery.previous")}
                sx={arrow}
              >
                <Prev size={18} />
              </IconButton>
              <Box
                component="span"
                aria-hidden
                sx={{
                  fontFamily: HAND,
                  fontSize: "1.3rem",
                  color: "warning.dark",
                  minWidth: 44,
                  textAlign: "center",
                  direction: "ltr",
                }}
              >
                {number.format(active + 1)} / {number.format(photos.length)}
              </Box>
              <IconButton onClick={() => go(1)} aria-label={t("landing.gallery.next")} sx={arrow}>
                <Next size={18} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* The large photo, mounted like a print: a pale olive mat (the colour of the
            navbar and icon bubbles) with a thin line
            around the photo and a soft shadow, to match the paper sheet. */}
        <Box
          sx={{
            alignSelf: "start", // sets the row height; the sheet stretches to match
            p: `${MAT}px`,
            bgcolor: "action.selected",
            borderRadius: "3px",
            boxShadow: "0 1px 2px rgba(60, 50, 20, 0.08), 0 16px 32px -14px rgba(60, 50, 20, 0.35)",
          }}
        >
          <Box
            key={photo.key}
            component="img"
            src={photo.src}
            alt={text(photo.key)}
            sx={{
              display: "block",
              width: "100%",
              aspectRatio: "3 / 2",
              objectFit: "cover",
              outline: "1px solid",
              outlineColor: (th) => alpha(th.palette.primary.dark, 0.15),
              animation: "galleryFade 350ms ease-out",
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          />
        </Box>
      </Box>
    </LandingSection>
  );
};
