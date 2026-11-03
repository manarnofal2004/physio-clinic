import { useState } from "react";
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

// Height of the large photo on wide screens: the screen minus the heading above and
// the strip of small photos under it.
const FEATURE_HEIGHT = "calc(100svh - 300px)";
const THUMB_HEIGHT = 72;

// One large photo with the name of the place, a line about it and arrows beside it,
// and a strip of small photos under it: picking one (or the arrows) shows it large.
// The photos keep their natural 3:2 shape.
export const GallerySection = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [active, setActive] = useState(0);
  const photo = photos[active] ?? photos[0]!;
  const number = new Intl.NumberFormat(i18n.language, { minimumIntegerDigits: 2 });
  const text = (key: string) => t(`landing.gallery.${key as GalleryKey}`);

  const go = (step: 1 | -1) => setActive((a) => (a + step + photos.length) % photos.length);
  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
      alignTop
    >
      <Box
        sx={{
          display: "grid",
          // The photo column is as wide as a 3:2 photo of the full height.
          gridTemplateColumns: {
            xs: "1fr",
            md: `min(calc(${FEATURE_HEIGHT} * 1.5), calc(100% - 300px)) 1fr`,
          },
          columnGap: 5,
          rowGap: { xs: 2, md: 2.5 },
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
            "@keyframes galleryFade": { from: { opacity: 0.4 }, to: { opacity: 1 } },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />

        {/* Beside the photo: its number, name, a line about the place and the arrows. */}
        <Box
          aria-live="polite"
          sx={{
            alignSelf: "end",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            pb: { md: 1 },
          }}
        >
          <Typography
            sx={{ color: "warning.main", fontSize: "1.1rem" }}
            dir="ltr"
            align={isRtl ? "right" : "left"}
          >
            {number.format(active + 1)} / {number.format(photos.length)}
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            sx={{
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: "primary.dark",
              lineHeight: 1.15,
            }}
          >
            {text(photo.key)}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            {text(`${photo.key}Text`)}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <IconButton
              onClick={() => go(-1)}
              aria-label={t("landing.gallery.previous")}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <Prev />
            </IconButton>
            <IconButton
              onClick={() => go(1)}
              aria-label={t("landing.gallery.next")}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <Next />
            </IconButton>
          </Box>
        </Box>

        {/* The strip of small photos under the large one. */}
        <Box
          role="list"
          aria-label={t("landing.gallery.photos")}
          sx={{ display: "flex", gap: 1.5, overflowX: "auto", scrollbarWidth: "none" }}
        >
          {photos.map((item, index) => {
            const isActive = index === active;
            return (
              <ButtonBase
                key={item.key}
                role="listitem"
                onClick={() => setActive(index)}
                aria-current={isActive || undefined}
                aria-label={text(item.key)}
                sx={{
                  flexShrink: 0,
                  borderRadius: 2.5,
                  p: "3px",
                  border: 2,
                  borderColor: isActive ? "primary.main" : "transparent",
                  transition: "border-color 200ms, opacity 200ms",
                  opacity: isActive ? 1 : 0.7,
                  "&:hover": { opacity: 1 },
                  "&:focus-visible": { outline: 2, outlineColor: "primary.main" },
                }}
              >
                <Box
                  component="img"
                  src={item.src}
                  alt=""
                  loading="lazy"
                  sx={{
                    display: "block",
                    height: THUMB_HEIGHT,
                    aspectRatio: "3 / 2",
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                />
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </LandingSection>
  );
};
