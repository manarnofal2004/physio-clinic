import { Box, Button, Typography } from "@mui/material";
import { Activity, Bone, Brain, Dumbbell, Hand, PersonStanding } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Translation } from "@/i18n/locales/en";
import { LandingSection } from "./LandingSection";

type ServiceKey = keyof Translation["landing"]["services"];

const services: { icon: ReactNode; title: ServiceKey; text: ServiceKey }[] = [
  { icon: <PersonStanding size={28} />, title: "backNeck", text: "backNeckText" },
  { icon: <Dumbbell size={28} />, title: "sports", text: "sportsText" },
  { icon: <Activity size={28} />, title: "surgery", text: "surgeryText" },
  { icon: <Bone size={28} />, title: "joints", text: "jointsText" },
  { icon: <Brain size={28} />, title: "neuro", text: "neuroText" },
  { icon: <Hand size={28} />, title: "manual", text: "manualText" },
];

// Two columns on desktop: the heading stays in view on one side while the list of
// services runs down the other, one row per service, separated by thin lines.
export const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="services">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { md: "5fr 7fr" },
          columnGap: 10,
          rowGap: 5,
          alignItems: "start",
        }}
      >
        <Box sx={{ position: { md: "sticky" }, top: { md: 120 } }}>
          <Typography variant="h2">{t("landing.services.title")}</Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 2, fontSize: "1.15rem", lineHeight: 1.7, maxWidth: "28em" }}
          >
            {t("landing.services.intro")}
          </Typography>
          <Button href="/#booking" sx={{ mt: 3, px: 0, "&:hover": { bgcolor: "transparent" } }}>
            {t("landing.services.book")}
          </Button>
        </Box>

        <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
          {services.map((service) => (
            <Box
              component="li"
              key={service.title}
              sx={{
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                columnGap: 2,
                py: 3,
                borderBottom: 1,
                borderColor: "divider",
                "&:first-of-type": { borderTop: 1, borderColor: "divider" },
              }}
            >
              <Box sx={{ pt: 0.25 }}>{service.icon}</Box>
              <div>
                <Typography variant="h5" component="h3">
                  {t(`landing.services.${service.title}`)}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {t(`landing.services.${service.text}`)}
                </Typography>
              </div>
            </Box>
          ))}
        </Box>
      </Box>
    </LandingSection>
  );
};
