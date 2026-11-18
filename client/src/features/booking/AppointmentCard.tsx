import { Box, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// Handwriting for the filled-in lines: Caveat for Latin, Aref Ruqaa for Arabic.
const HAND = '"Caveat", "Aref Ruqaa", cursive';

interface AppointmentCardProps {
  name: string;
  day: string; // already written out, e.g. "Tuesday 10 November"
  time: string;
  sent: boolean; // the request went out: the stamp is pressed on
}

// A clinic appointment card on torn paper, with the logo at the top, that fills in, in
// dark honey handwriting, while the visitor fills the form. Once the request is sent a
// round stamp over the lines says it is waiting for the clinic to confirm.
export const AppointmentCard = ({ name, day, time, sent }: AppointmentCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const light = theme.palette.mode === "light";
  const rule = `1px solid ${alpha(theme.palette.primary.dark, 0.25)}`;
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
          backgroundImage: `url(/images/${light ? "paper" : "paper-dark"}.webp)`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          px: { xs: 3, md: 4 },
          pt: 4.5,
          pb: 5.5,
          // Short laptop screens: a slightly shorter card so the section fits one screen.
          "@media (min-width: 900px) and (max-height: 700px)": {
            pt: 3.5,
            pb: 4,
            "& dl > div": { py: 0.75 },
          },
        }}
      >
        <Box
          component="img"
          src={light ? "/logo-full.png?v=3" : "/logo-full-dark.png?v=3"}
          alt=""
          sx={{ display: "block", height: 48, width: "auto", mx: "auto" }}
        />
        <Typography
          component="p"
          variant="h3"
          sx={{
            textAlign: "center",
            color: "primary.dark",
            mt: 0.75,
            mb: 1.75,
            fontSize: "1.8rem",
          }}
        >
          {t("booking.card.title")}
        </Typography>

        <Box sx={{ position: "relative" }}>
          <Box component="dl" sx={{ m: 0 }}>
            {rows.map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 1.5,
                  py: 1,
                  // Ruled lines like a printed card.
                  borderTop: rule,
                  "&:last-of-type": { borderBottom: rule },
                }}
              >
                <Box component="dt" sx={{ color: "text.primary", minWidth: 60 }}>
                  {row.label}
                </Box>
                <Box
                  component="dd"
                  sx={{
                    m: 0,
                    fontFamily: HAND,
                    fontSize: "1.6rem",
                    lineHeight: 1.15,
                    minHeight: "1.15em",
                    // Dark honey ink, clear on the cream paper (lighter on the dark paper).
                    color: light ? "#6b4a12" : "#e7c98f",
                    "&:lang(ar)": { fontSize: "1.45rem" },
                  }}
                >
                  {row.value}
                </Box>
              </Box>
            ))}
          </Box>

          {/* The stamp under the lines: faint while the visitor is still choosing,
              pressed on once the request is sent. */}
          <Box
            aria-hidden={!sent}
            sx={{
              mx: "auto",
              mt: 3,
              width: 140,
              height: 140,
              boxSizing: "border-box",
              borderRadius: "50%",
              // Deep olive ink, in capitals like a rubber stamp.
              border: "4px double",
              borderColor: "primary.dark",
              color: "primary.dark",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              "&:lang(ar)": { letterSpacing: 0, fontSize: "0.95rem" },
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              lineHeight: 1.3,
              // Wide enough inside the ring for the longest word ("CONFIRMATION"),
              // so both lines stay centred.
              p: 1,
              transform: "rotate(-12deg)",
              opacity: sent ? 1 : 0.75,
              transition: "opacity 300ms",
              pointerEvents: "none",
              "@keyframes stampIn": {
                from: { transform: "rotate(-12deg) scale(1.4)", opacity: 0 },
                to: { transform: "rotate(-12deg) scale(1)", opacity: 1 },
              },
              ...(sent && { animation: "stampIn 350ms cubic-bezier(0.22, 1, 0.36, 1)" }),
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            {t("booking.card.stamp")}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
