import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePublicBanners, type Banner } from "./api";
import { bannerColors } from "./bannerStyle";
import { BannerTypeIcon } from "./BannerTypeIcon";

export const BAR_HEIGHT = 38;
const AUTO_MS = 6000; // several banners take turns every 6 seconds
const STORAGE_KEY = "dismissed-banners";

// A banner stays closed until it is edited, so the key includes its last update.
const bannerKey = (banner: Banner) => `${banner.id}:${banner.updatedAt}`;

const readDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

// The thin bar above the navbar with the clinic's announcements. Announcements are
// pale olive with a megaphone; schedule changes are soft honey with a clock, so they
// stand out a little more. Several banners take turns, and the close button hides
// them until a new or edited banner comes along. Nothing shows when there are none.
export const AnnouncementBar = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const { data } = usePublicBanners();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const banners = (data ?? []).filter((banner) => !dismissed.includes(bannerKey(banner)));
  const count = banners.length;
  const banner = banners[index % Math.max(count, 1)];

  // Sections that fill one screen leave room for the bar while it shows.
  useEffect(() => {
    const root = document.documentElement;
    if (count > 0)
      root.style.setProperty("--banner-height", `${BAR_HEIGHT + 1}px`); // + its border
    else root.style.removeProperty("--banner-height");
    return () => {
      root.style.removeProperty("--banner-height");
    };
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => window.clearTimeout(id);
  }, [index, count, paused, reduceMotion]);

  if (!banner) return null;

  const close = () => {
    const next = [...dismissed, ...banners.map(bannerKey)];
    setDismissed(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Without storage the bar just comes back on the next visit.
    }
  };

  const colors = bannerColors(banner.type, theme.palette.mode);
  // Arrows point the way the banners move: in Arabic "next" is to the left.
  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;
  const small = { color: colors.fg, p: 0.5 };

  return (
    <Box
      role="region"
      aria-label={t("banner.label")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      sx={{
        display: "grid",
        gridTemplateColumns: "88px 1fr 88px",
        alignItems: "center",
        minHeight: BAR_HEIGHT,
        px: { xs: 1, md: 3 },
        bgcolor: colors.bg,
        color: colors.fg,
        borderBottom: 1,
        borderColor: "divider",
        transition: "background-color 300ms",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        {count > 1 && (
          <>
            <IconButton
              size="small"
              aria-label={t("banner.previous")}
              onClick={() => setIndex((i) => (i - 1 + count) % count)}
              sx={small}
            >
              <Prev size={16} />
            </IconButton>
            <IconButton
              size="small"
              aria-label={t("banner.next")}
              onClick={() => setIndex((i) => (i + 1) % count)}
              sx={small}
            >
              <Next size={16} />
            </IconButton>
            <Typography
              variant="body2"
              sx={{ opacity: 0.7, display: { xs: "none", sm: "block" }, ms: 0.5 }}
            >
              {(index % count) + 1} / {count}
            </Typography>
          </>
        )}
      </Box>

      <Box
        key={banner.id}
        aria-live="polite"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          py: 0.75,
          textAlign: "center",
          "@keyframes bannerIn": { from: { opacity: 0 }, to: { opacity: 1 } },
          animation: "bannerIn 300ms ease-out",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        <Box component="span" aria-hidden sx={{ display: "flex", color: "warning.main" }}>
          <BannerTypeIcon type={banner.type} size={17} />
        </Box>
        <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.4 }}>
          {i18n.language.startsWith("ar") ? banner.messageAr : banner.messageEn}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton size="small" aria-label={t("banner.close")} onClick={close} sx={small}>
          <X size={16} />
        </IconButton>
      </Box>
    </Box>
  );
};
