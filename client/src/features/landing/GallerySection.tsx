import { useEffect, useState } from "react";
import { Box, ButtonBase, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

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

// One large photo, and beside it the next three photos as a small stack of prints
// peeking out (clicking the stack moves on), then the number, name and a line
// about the place, with arrows. The photos keep their natural 3:2 shape.
export const GallerySection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [active, setActive] = useState(0);
  const at = (offset: number) => photos[(active + offset) % photos.length] ?? photos[0]!;
  const photo = at(0);
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
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
  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;
  const arrow = { border: 1, borderColor: "divider", "&:hover": { bgcolor: "action.selected" } };

  // One print in the stack: a white border, a soft shadow and a slight tilt.
  const print = (offset: 1 | 2 | 3, sx: object) => {
    const item = at(offset);
    return (
      <Box
        key={`${item.key}-${offset}`}
        component="img"
        src={item.src}
        alt=""
        sx={{
          position: "absolute",
          width: "70%",
          aspectRatio: "3 / 2",
          objectFit: "cover",
          borderRadius: 2.5,
          border: "5px solid",
          borderColor: "background.paper",
          boxShadow: "0 18px 40px -18px rgba(40, 50, 20, 0.45)",
          transition: "transform 300ms ease-out",
          animation: "galleryFade 350ms ease-out",
          ...sx,
        }}
      />
    );
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
          // The photo column is a 3:2 photo a little under the full height, leaving
          // room beside it for the stack and the text.
          gridTemplateColumns: {
            xs: "1fr",
            md: `min(calc(${FEATURE_HEIGHT} * 1.38), calc(100% - 380px)) 1fr`,
          },
          alignItems: "center",
          gap: { xs: 3, md: 4 },
          "@keyframes galleryFade": { from: { opacity: 0.4 }, to: { opacity: 1 } },
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
            borderRadius: 4,
            animation: "galleryFade 350ms ease-out",
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: { md: 3 } }}>
          {/* The next three photos, stacked like prints; clicking shows the next one.
              The stack is sized from the screen height so the text under it always
              stays on screen. */}
          <ButtonBase
            onClick={() => go(1)}
            aria-label={`${t("landing.gallery.next")}: ${text(at(1).key)}`}
            sx={{
              display: { xs: "none", md: "block" },
              position: "relative",
              width: `min(100%, calc((${FEATURE_HEIGHT} - 230px) * 1.5))`,
              aspectRatio: "3 / 2",
              borderRadius: 3,
              "&:hover img:last-of-type": { transform: "rotate(-1deg) translateY(-6px)" },
              "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 4 },
            }}
          >
            {print(3, { top: 0, insetInlineEnd: 0, transform: "rotate(6deg)" })}
            {print(2, { top: "12%", insetInlineStart: "15%", transform: "rotate(-1deg)" })}
            {print(1, { top: "26%", insetInlineStart: 0, transform: "rotate(-5deg)" })}
          </ButtonBase>

          {/* The number, name and a line about the photo shown large, with arrows. */}
          <Box aria-live="polite" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Typography sx={{ color: "warning.main", fontSize: "1.05rem" }}>
              <bdi>
                {number.format(active + 1)} / {number.format(photos.length)}
              </bdi>
            </Typography>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontSize: { xs: "1.8rem", md: "2.3rem" },
                color: "primary.dark",
                lineHeight: 1.15,
              }}
            >
              {text(photo.key)}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
              {text(`${photo.key}Text`)}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <IconButton
                onClick={() => go(-1)}
                aria-label={t("landing.gallery.previous")}
                sx={arrow}
              >
                <Prev />
              </IconButton>
              <IconButton onClick={() => go(1)} aria-label={t("landing.gallery.next")} sx={arrow}>
                <Next />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </LandingSection>
  );
};
