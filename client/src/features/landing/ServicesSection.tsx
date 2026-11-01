import { Box, ButtonBase, Typography } from "@mui/material";
import { Activity, Bone, Brain, Dumbbell, Hand, PersonStanding } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type ServiceKey = keyof Translation["landing"]["services"];

interface Service {
  icon: ReactNode;
  image: string;
  title: ServiceKey;
  text: ServiceKey;
}

const ICON_SIZE = 20;

const services: Service[] = [
  {
    icon: <PersonStanding size={ICON_SIZE} />,
    image: "/images/services/back-neck.webp",
    title: "backNeck",
    text: "backNeckText",
  },
  {
    icon: <Dumbbell size={ICON_SIZE} />,
    image: "/images/services/sports.webp",
    title: "sports",
    text: "sportsText",
  },
  {
    icon: <Activity size={ICON_SIZE} />,
    image: "/images/services/surgery.webp",
    title: "surgery",
    text: "surgeryText",
  },
  {
    icon: <Bone size={ICON_SIZE} />,
    image: "/images/services/joints.webp",
    title: "joints",
    text: "jointsText",
  },
  {
    icon: <Brain size={ICON_SIZE} />,
    image: "/images/services/neuro.webp",
    title: "neuro",
    text: "neuroText",
  },
  {
    icon: <Hand size={ICON_SIZE} />,
    image: "/images/services/manual.webp",
    title: "manual",
    text: "manualText",
  },
];

// Expanding panels: every service is visible as a photo; the open one widens to show
// its title and description, and clicking another panel opens that one instead.
// Wide screens lay the panels side by side, phones stack them (open one grows taller).
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

export const ServicesSection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(0);

  return (
    <LandingSection
      id="services"
      title={t("landing.services.title")}
      intro={t("landing.services.intro")}
      wash
    >
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          height: { md: 460 },
        }}
      >
        {services.map((service, index) => {
          const isOpen = index === open;
          return (
            <Box
              component="li"
              key={service.title}
              sx={{
                position: "relative",
                minWidth: 0,
                flexGrow: { md: isOpen ? 5 : 1 },
                flexBasis: { md: 0 },
                height: { xs: isOpen ? 320 : 84, md: "auto" },
                borderRadius: 4,
                overflow: "hidden",
                transition: `flex-grow 500ms ${EASE}, height 500ms ${EASE}`,
                "@media (prefers-reduced-motion: reduce)": { transition: "none" },
              }}
            >
              <ButtonBase
                onClick={() => setOpen(index)}
                aria-expanded={isOpen}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  textAlign: "start",
                  "&:focus-visible": {
                    outline: 3,
                    outlineColor: "primary.main",
                    outlineOffset: -3,
                  },
                }}
              >
                <Box
                  component="img"
                  src={service.image}
                  alt=""
                  loading="lazy"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isOpen ? "scale(1)" : "scale(1.08)",
                    transition: `transform 700ms ${EASE}`,
                  }}
                />
                {/* Darkens the lower part so the white text stays readable. */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: isOpen
                      ? "linear-gradient(to top, rgba(22, 30, 14, 0.85) 0%, rgba(22, 30, 14, 0.35) 45%, transparent 70%)"
                      : "rgba(22, 30, 14, 0.35)",
                    transition: `background 500ms ${EASE}`,
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    insetInline: 0,
                    bottom: 0,
                    p: { xs: 2, md: 2.5 },
                    display: "flex",
                    flexDirection: { xs: "row", md: isOpen ? "row" : "column" },
                    alignItems: { xs: "center", md: isOpen ? "flex-end" : "center" },
                    gap: 1.5,
                    color: "common.white",
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "primary.main",
                      "& svg": { stroke: "#fff" },
                    }}
                  >
                    {service.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      component="h3"
                      sx={{
                        fontSize: { xs: "1.1rem", md: "1.35rem" },
                        fontWeight: 700,
                        lineHeight: 1.25,
                        // Closed panels on wide screens are too narrow for the title.
                        display: { xs: "block", md: isOpen ? "block" : "none" },
                      }}
                    >
                      {t(`landing.services.${service.title}`)}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        maxWidth: "30em",
                        opacity: 0.9,
                        display: isOpen ? "block" : "none",
                      }}
                    >
                      {t(`landing.services.${service.text}`)}
                    </Typography>
                  </Box>
                </Box>
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </LandingSection>
  );
};
