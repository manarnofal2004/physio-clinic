import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Handwriting for the filled-in lines: Caveat for Latin, Aref Ruqaa for Arabic.
const HAND = '"Caveat", "Aref Ruqaa", cursive';

interface AppointmentCardProps {
  name: string;
  day: string; // already written out, e.g. "Tuesday 10 November"
  time: string;
  sent: boolean; // the request went out: the stamp is pressed on
}

// A clinic appointment card on torn paper that fills in, in honey handwriting, while
// the visitor fills the form. Once the request is sent a round stamp says it is waiting
// for the clinic to confirm.
export const AppointmentCard = ({ name, day, time, sent }: AppointmentCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const rows = [
    { label: t("booking.card.name"), value: name },
    { label: t("booking.card.day"), value: day },
    { label: t("booking.card.time"), value: time },
    { label: t("booking.card.session"), value: t("booking.card.sessionLength") },
  ];

  return (
    <Box
      role="region"
      aria-label={t("booking.card.label")}
      aria-live="polite"
      sx={{
        filter: "drop-shadow(0 12px 20px rgba(60, 50, 20, 0.18))",
        transform: "rotate(1.5deg)",
        maxWidth: 400,
        mx: "auto",
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          // The same torn paper as the gallery sheet. Separate properties: the RTL
          // plugin garbles the shorthand.
          backgroundImage: `url(/images/${theme.palette.mode === "light" ? "paper" : "paper-dark"}.webp)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          px: { xs: 3, md: 4 },
          pt: 5,
          pb: 6,
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            letterSpacing: "0.3em",
            fontSize: "0.85rem",
            color: "primary.dark",
          }}
        >
          SANAD · سَنَد
        </Typography>
        <Typography
          component="p"
          variant="h3"
          sx={{ textAlign: "center", color: "primary.dark", mt: 0.5, mb: 2.5 }}
        >
          {t("booking.card.title")}
        </Typography>

        <Box component="dl" sx={{ m: 0 }}>
          {rows.map((row) => (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.5,
                py: 0.75,
                borderTop: 1,
                borderColor: "divider",
                "&:last-of-type": { borderBottom: 1, borderColor: "divider" },
              }}
            >
              <Box component="dt" sx={{ color: "text.secondary", minWidth: 64 }}>
                {row.label}
              </Box>
              <Box
                component="dd"
                sx={{
                  m: 0,
                  fontFamily: HAND,
                  fontSize: "1.45rem",
                  lineHeight: 1.2,
                  color: "warning.dark",
                  minHeight: "1.2em",
                }}
              >
                {row.value}
              </Box>
            </Box>
          ))}
        </Box>

        {/* The stamp: faint while the visitor is still choosing, pressed on once sent. */}
        <Box
          aria-hidden={!sent}
          sx={{
            width: 130,
            height: 130,
            mx: "auto",
            mt: 3,
            borderRadius: "50%",
            border: "3px double",
            borderColor: "primary.main",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            fontSize: "0.95rem",
            lineHeight: 1.3,
            px: 2,
            transform: "rotate(-12deg)",
            opacity: sent ? 0.85 : 0.18,
            transition: "opacity 300ms",
            "@keyframes stampIn": {
              from: { transform: "rotate(-12deg) scale(1.4)", opacity: 0 },
              to: { transform: "rotate(-12deg) scale(1)", opacity: 0.85 },
            },
            ...(sent && { animation: "stampIn 350ms cubic-bezier(0.22, 1, 0.36, 1)" }),
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        >
          {t("booking.card.stamp")}
        </Box>
      </Box>
    </Box>
  );
};
