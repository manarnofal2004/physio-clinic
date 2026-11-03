import { Box, Button, ButtonBase, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Check } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";
import { WaveClipPath } from "./wave";

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
  const panelColor = theme.palette.background.panel;
  const hoverColor = theme.palette.action.selected;
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

  // A square outside the tab's bottom corner, filled with the tab's colour except
  // for a quarter circle, which draws the inward curve.
  const shoulder = (side: "start" | "end", color: string) => {
    // The RTL style plugin does not mirror gradient positions, so pick the side here.
    const atLeft = (side === "start") !== isRtl;
    return {
      content: '""',
      position: "absolute" as const,
      bottom: 0,
      [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: -RADIUS,
      width: RADIUS,
      height: RADIUS,
      background: `radial-gradient(circle at ${atLeft ? "0 0" : "100% 0"}, transparent ${RADIUS}px, ${color} ${RADIUS + 0.5}px)`,
      transition: "opacity 200ms",
    };
  };

  return (
    <LandingSection id="services" title={t("landing.services.title")} compact>
      <Box
        role="tablist"
        aria-label={t("landing.services.title")}
        onKeyDown={onKeyDown}
        sx={{
          display: "flex",
          gap: 0.5,
          // Leaves a straight stretch between the panel's round corner and the first
          // tab's curve, so the two curves never touch.
          px: { xs: 4, md: 9 },
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
                px: { xs: 2.5, md: 2.25 },
                py: 1.75,
                fontSize: "0.98rem",
                fontFamily: "inherit",
                borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
                color: isSelected ? "common.white" : "text.secondary",
                bgcolor: isSelected ? panelColor : "transparent",
                transition: "color 200ms, background-color 200ms",
                "&:focus-visible": { outline: 2, outlineColor: "primary.main" },
                // Selected: the tab and its shoulders take the panel colour.
                // Others: on hover the same folder shape appears in pale olive,
                // a preview that says "click to open this one".
                "&::before": shoulder("start", isSelected ? panelColor : hoverColor),
                "&::after": shoulder("end", isSelected ? panelColor : hoverColor),
                ...(!isSelected && {
                  "&::before, &::after": { opacity: 0 },
                  "&:hover": {
                    bgcolor: hoverColor,
                    color: "text.primary",
                    "&::before, &::after": { opacity: 1 },
                  },
                }),
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
          borderRadius: 3, // 24px: small enough that the tab shoulders sit on the straight edge
          position: "relative",
          overflow: "hidden", // the photo takes the panel's rounded corners
          minHeight: { md: 440 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            width: { md: "48%" },
            minHeight: { md: 440 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" component="h3" sx={{ fontSize: { xs: "1.9rem", md: "2.3rem" } }}>
            {t(key(service.id))}
          </Typography>
          <Typography
            sx={{ mt: 1.5, fontSize: "1.1rem", lineHeight: 1.7, opacity: 0.85, maxWidth: "30em" }}
          >
            {t(key(service.id, "Text"))}
          </Typography>

          {/* What this service covers: a short list split by hairlines, each point
              marked with a small outlined check. */}
          <Box component="ul" sx={{ mt: 3.5, mb: 0, p: 0, listStyle: "none", maxWidth: 440 }}>
            {(["1", "2", "3"] as const).map((n) => (
              <Box
                component="li"
                key={n}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  py: 1.5,
                  fontSize: "1.05rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.18)",
                  "&:last-of-type": { borderBottom: "1px solid rgba(255, 255, 255, 0.18)" },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.55)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Check size={14} strokeWidth={2.25} color="currentColor" />
                </Box>
                {t(key(service.id, n))}
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            href="/#booking"
            sx={{
              mt: 4,
              alignSelf: "flex-start",
              px: 3.5,
              bgcolor: "background.wash",
              color: "primary.dark",
              "&:hover": { bgcolor: "common.white" },
            }}
          >
            {t("landing.services.book")}
          </Button>
        </Box>

        {/* The photo fills the far half of the panel up to its edges, with the same
            wave as the hero on the side facing the text. Phones show it full width
            under the text instead. */}
        <Box
          sx={{
            top: 0,
            bottom: 0,
            insetInlineEnd: 0,
            position: { xs: "relative", md: "absolute" },
            width: { md: "52%" },
            height: { xs: 240, sm: 320, md: "auto" },
          }}
        >
          <WaveClipPath id="service-wave" isRtl={isRtl} />
          {/* A lighter band following the wave just outside the photo, as in the hero. */}
          <Box
            aria-hidden
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              top: 0,
              bottom: 0,
              insetInlineEnd: 0,
              width: "calc(100% + 26px)",
              bgcolor: "rgba(255, 255, 255, 0.22)",
              clipPath: "url(#service-wave)",
            }}
          />
          <Box
            key={service.id}
            component="img"
            src={service.image}
            alt=""
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              clipPath: { md: "url(#service-wave)" },
              animation: "serviceFade 300ms ease-out",
              "@keyframes serviceFade": { from: { opacity: 0 }, to: { opacity: 1 } },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          />
        </Box>
      </Box>
    </LandingSection>
  );
};
