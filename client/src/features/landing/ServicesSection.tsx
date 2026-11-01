import { Box, Button, ButtonBase, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Check } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type ServiceKey = keyof Translation["landing"]["services"];
type ServiceId = "backNeck" | "sports" | "surgery" | "joints" | "neuro" | "manual";

// Each service has a title (its id), a one-line description (id + "Text") and three
// points (id + "1".."3") in the translation files, plus a photo.
interface Service {
  id: ServiceId;
  image: string;
}

const FIRST: Service = { id: "backNeck", image: "/images/services/back-neck.webp" };

const services: Service[] = [
  FIRST,
  { id: "sports", image: "/images/services/sports.webp" },
  { id: "surgery", image: "/images/services/surgery.webp" },
  { id: "joints", image: "/images/services/joints.webp" },
  { id: "neuro", image: "/images/services/neuro.webp" },
  { id: "manual", image: "/images/services/manual.webp" },
];

const RADIUS = 20; // corner radius of the tab and of its curved "shoulders"

// Folder-style tabs: the selected tab joins the dark panel below it, with small
// inward curves on both sides so tab and panel read as one shape.
export const ServicesSection = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const panelColor = theme.palette.primary.dark;
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Every id + suffix combination exists in the translation files.
  const key = (id: ServiceId, suffix: "" | "Text" | "1" | "2" | "3" = "") =>
    `landing.services.${id}${suffix}` as `landing.services.${ServiceKey}`;
  const service = services[selected] ?? FIRST;

  // Arrow keys move between tabs (left/right swap meaning in Arabic).
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (selected + (isRtl ? -step : step) + services.length) % services.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  // A square outside the tab's bottom corner, filled with the panel colour except
  // for a quarter circle, which draws the inward curve.
  const shoulder = (side: "start" | "end") => {
    const atLeft = (side === "start") !== isRtl;
    return {
      content: '""',
      position: "absolute" as const,
      bottom: 0,
      [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: -RADIUS,
      width: RADIUS,
      height: RADIUS,
      background: `radial-gradient(circle at ${atLeft ? "0 0" : "100% 0"}, transparent ${RADIUS}px, ${panelColor} ${RADIUS + 0.5}px)`,
    };
  };

  return (
    <LandingSection
      id="services"
      title={t("landing.services.title")}
      intro={t("landing.services.intro")}
    >
      <Box
        role="tablist"
        aria-label={t("landing.services.title")}
        onKeyDown={onKeyDown}
        sx={{
          display: "flex",
          gap: 0.5,
          px: { xs: 2.5, md: 5 },
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {services.map((item, index) => {
          const isSelected = index === selected;
          return (
            <ButtonBase
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`service-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls="service-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(index)}
              sx={{
                position: "relative",
                flexShrink: 0,
                px: { xs: 2.5, md: 2.75 },
                py: 1.75,
                fontSize: "1rem",
                fontFamily: "inherit",
                borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
                color: isSelected ? "common.white" : "text.secondary",
                bgcolor: isSelected ? panelColor : "transparent",
                transition: "color 150ms, background-color 150ms",
                "&:hover": { color: isSelected ? "common.white" : "text.primary" },
                "&:focus-visible": { outline: 2, outlineColor: "primary.main" },
                ...(isSelected && { "&::before": shoulder("start"), "&::after": shoulder("end") }),
              }}
            >
              {t(key(item.id))}
            </ButtonBase>
          );
        })}
      </Box>

      <Box
        role="tabpanel"
        id="service-panel"
        aria-labelledby={`service-tab-${service.id}`}
        sx={{
          bgcolor: panelColor,
          color: "common.white",
          borderRadius: 6,
          p: { xs: 3, md: 7 },
          display: "grid",
          gridTemplateColumns: { md: "1fr 1fr" },
          gap: { xs: 4, md: 8 },
          alignItems: "center",
        }}
      >
        <div>
          <Typography variant="h3" component="h3">
            {t(key(service.id))}
          </Typography>
          <Typography sx={{ mt: 2, fontSize: "1.1rem", lineHeight: 1.7, opacity: 0.9 }}>
            {t(key(service.id, "Text"))}
          </Typography>
          <Box
            component="ul"
            sx={{ mt: 4, mb: 0, p: 0, listStyle: "none", display: "grid", gap: 2 }}
          >
            {(["1", "2", "3"] as const).map((n) => (
              <Box
                component="li"
                key={n}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, fontSize: "1.05rem" }}
              >
                <Check size={20} color="currentColor" />
                {t(key(service.id, n))}
              </Box>
            ))}
          </Box>
          <Button
            variant="contained"
            size="large"
            href="/#booking"
            sx={{
              mt: 5,
              px: 3.5,
              bgcolor: "background.wash",
              color: "primary.dark",
              "&:hover": { bgcolor: "common.white" },
            }}
          >
            {t("landing.services.book")}
          </Button>
        </div>

        <Box
          key={service.id}
          component="img"
          src={service.image}
          alt=""
          sx={{
            display: "block",
            width: "100%",
            aspectRatio: "4 / 3",
            objectFit: "cover",
            borderRadius: 4,
            animation: "serviceFade 300ms ease-out",
            "@keyframes serviceFade": { from: { opacity: 0 }, to: { opacity: 1 } },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
      </Box>
    </LandingSection>
  );
};
