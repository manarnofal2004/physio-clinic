import { useState } from "react";
import { Box, ButtonBase, Dialog, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type PhotoKey = keyof Translation["landing"]["gallery"];

interface Photo {
  key: PhotoKey; // caption and alt text
  src: string;
  rise: number; // height as a share of the tallest arch, so the tops form a wave
}

const photos: Photo[] = [
  { key: "reception", src: "/images/gallery/reception.webp", rise: 0.74 },
  { key: "handsOn", src: "/images/gallery/hands-on.webp", rise: 0.87 },
  { key: "treatment", src: "/images/gallery/treatment.webp", rise: 1 },
  { key: "exercise", src: "/images/gallery/exercise.webp", rise: 0.87 },
  { key: "waiting", src: "/images/gallery/waiting.webp", rise: 0.74 },
];

// Height of the tallest arch on wide screens: what is left of the screen after the
// heading, the captions and the wave above the arches.
const ARCH_HEIGHT = "calc(100svh - 330px)";
const WAVE_SPACE = 64; // room above the tallest arch for the honey line
const LIFT = 6; // gap between an arch top and the honey line, in % of the area

// Where each arch top sits, in % of the area (the tallest arch is about 600px high
// with 64px of room above it), and the wave points: just above each arch top, with a
// dip between two arches.
const archTop = (rise: number) => ((WAVE_SPACE + 600 * (1 - rise)) / (600 + WAVE_SPACE)) * 100;
const points = photos.map((photo, i) => ({ x: 10 + i * 20, y: archTop(photo.rise) - LIFT }));
const wavePoints = points.flatMap((point, i) => {
  const next = points[i + 1];
  return next ? [point, { x: point.x + 10, y: (point.y + next.y) / 2 + 7 }] : [point];
});

// A smooth line through the wave points (Catmull-Rom turned into cubic curves), from
// edge to edge of the area.
const wavePath = () => {
  const all = [
    { x: -2, y: wavePoints[0]!.y + 12 },
    ...wavePoints,
    { x: 102, y: wavePoints.at(-1)!.y + 12 },
  ];
  let d = `M ${all[0]!.x * 10} ${all[0]!.y}`;
  for (let i = 0; i < all.length - 1; i++) {
    const p0 = all[i - 1] ?? all[i]!;
    const p1 = all[i]!;
    const p2 = all[i + 1]!;
    const p3 = all[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x * 10} ${c1.y}, ${c2.x * 10} ${c2.y}, ${p2.x * 10} ${p2.y}`;
  }
  return d;
};
const WAVE = wavePath();

// Five photos in arched frames whose tops rise and fall like a wave, joined by a
// honey line with a dot over each arch and a pale olive wash behind. Clicking a
// photo opens it large. On phones the arches scroll sideways.
export const GallerySection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const washColor = theme.palette.action.selected;
  const [open, setOpen] = useState<Photo | null>(null);

  return (
    <LandingSection
      id="gallery"
      title={t("landing.gallery.title")}
      intro={t("landing.gallery.intro")}
      alignTop
    >
      <Box sx={{ position: "relative", pt: { md: `${WAVE_SPACE}px` } }}>
        {/* The pale wash and the honey line, drawn behind the arches. */}
        <Box
          component="svg"
          aria-hidden
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 0,
            insetInline: 0,
            width: "100%",
            height: `calc(${ARCH_HEIGHT} + ${WAVE_SPACE}px)`,
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="gallery-wash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={washColor} stopOpacity="1" />
              <stop offset="1" stopColor={washColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${WAVE} L 1020 75 L -20 75 Z`} fill="url(#gallery-wash)" />
          <Box
            component="path"
            d={WAVE}
            fill="none"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            sx={{ stroke: (th) => th.palette.warning.main }}
          />
        </Box>
        {points.map((point, i) => (
          <Box
            key={i}
            aria-hidden
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              left: `${point.x}%`,
              top: `calc((${ARCH_HEIGHT} + ${WAVE_SPACE}px) * ${point.y / 100})`,
              width: 11,
              height: 11,
              borderRadius: "50%",
              bgcolor: "primary.main",
              boxShadow: (th) => `0 0 0 3px ${th.palette.background.default}`,
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          />
        ))}

        <Box
          component="ul"
          sx={{
            position: "relative",
            m: 0,
            p: 0,
            listStyle: "none",
            display: "flex",
            alignItems: "flex-end",
            gap: { xs: 2, md: 2.5 },
            height: { md: ARCH_HEIGHT },
            overflowX: { xs: "auto", md: "visible" },
            scrollSnapType: { xs: "x mandatory", md: "none" },
            scrollbarWidth: "none",
          }}
        >
          {photos.map((photo) => (
            <Box
              component="li"
              key={photo.key}
              sx={{
                flex: { xs: "0 0 62%", sm: "0 0 40%", md: 1 },
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ButtonBase
                onClick={() => setOpen(photo)}
                aria-label={`${t("landing.gallery.open")}: ${t(`landing.gallery.${photo.key}`)}`}
                sx={{
                  height: { xs: 340, md: `calc(${ARCH_HEIGHT} * ${photo.rise})` },
                  // An arch: round top, softly rounded bottom corners.
                  borderRadius: "999px 999px 20px 20px",
                  overflow: "hidden",
                  "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 3 },
                  "& img": { transition: "transform 500ms ease-out" },
                  "&:hover img": { transform: "scale(1.04)" },
                  "@media (prefers-reduced-motion: reduce)": { "& img": { transition: "none" } },
                }}
              >
                <Box
                  component="img"
                  src={photo.src}
                  alt={t(`landing.gallery.${photo.key}`)}
                  loading="lazy"
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </ButtonBase>
              <Typography sx={{ mt: 1.5, textAlign: "center", color: "primary.dark" }}>
                {t(`landing.gallery.${photo.key}`)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        maxWidth="lg"
        slotProps={{
          paper: { sx: { bgcolor: "transparent", boxShadow: "none", m: 2, position: "relative" } },
        }}
      >
        {open && (
          <>
            <Box
              component="img"
              src={open.src}
              alt={t(`landing.gallery.${open.key}`)}
              sx={{ display: "block", maxWidth: "100%", maxHeight: "85vh", borderRadius: 3 }}
            />
            <IconButton
              onClick={() => setOpen(null)}
              aria-label={t("landing.gallery.close")}
              sx={{
                position: "absolute",
                top: 12,
                insetInlineEnd: 12,
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <X />
            </IconButton>
          </>
        )}
      </Dialog>
    </LandingSection>
  );
};
