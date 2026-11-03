import type { ReactNode } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LandingSection } from "./LandingSection";

interface DetailProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

const Detail = ({ icon, label, children }: DetailProps) => (
  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
    <Box aria-hidden sx={{ pt: 0.25 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.5, fontSize: "1.1rem" }}>{children}</Box>
    </Box>
  </Box>
);

// How to reach the clinic, on a pale olive band. The texts (address, phone...) live in
// the translation files, so the real details can be filled in there.
export const ContactSection = () => {
  const { t } = useTranslation();
  const phone = t("landing.contact.phone");
  const email = t("landing.contact.email");

  return (
    <LandingSection id="contact" title={t("landing.contact.title")} tinted>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: { xs: 3.5, md: 4 },
        }}
      >
        <Detail icon={<MapPin />} label={t("landing.contact.addressLabel")}>
          {t("landing.contact.address")}
        </Detail>
        <Detail icon={<Phone />} label={t("landing.contact.phoneLabel")}>
          {/* Phone numbers read left to right in Arabic too. */}
          <Link href={`tel:${phone.replace(/\s/g, "")}`} underline="hover" dir="ltr">
            {phone}
          </Link>
        </Detail>
        <Detail icon={<Mail />} label={t("landing.contact.emailLabel")}>
          <Link href={`mailto:${email}`} underline="hover">
            {email}
          </Link>
        </Detail>
        <Detail icon={<Clock />} label={t("landing.contact.hoursLabel")}>
          {t("landing.contact.hours")}
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {t("landing.contact.closed")}
          </Typography>
        </Detail>
      </Box>

      <Button
        variant="outlined"
        size="large"
        href={`tel:${phone.replace(/\s/g, "")}`}
        startIcon={<Phone size={18} />}
        sx={{ mt: { xs: 4, md: 5 } }}
      >
        {t("landing.contact.call")}
      </Button>
    </LandingSection>
  );
};
