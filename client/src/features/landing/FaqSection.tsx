import { useEffect, useState, type ReactNode } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { SendHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LandingSection } from "./LandingSection";

const questions = ["1", "2", "3", "4", "5"] as const;
type Question = (typeof questions)[number];

const TYPING_MS = 700; // how long the clinic "types" before the answer appears

// The questions as a quiet message thread with the clinic: the visitor's questions
// sit on the start side as bubbles, and tapping one makes Sanad "type" for a moment
// and answer in a pale olive bubble on the end side. One answer is open at a time;
// the first one is open to show how it works.
export const FaqSection = () => {
  const { t } = useTranslation();
  const isRtl = useTheme().direction === "rtl";
  const [open, setOpen] = useState<Question | null>("1");
  const [typing, setTyping] = useState(false);
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (!typing) return;
    const id = window.setTimeout(() => setTyping(false), TYPING_MS);
    return () => window.clearTimeout(id);
  }, [typing]);

  const ask = (n: Question) => {
    if (open === n) {
      setOpen(null);
      return;
    }
    setOpen(n);
    setTyping(!reduceMotion);
  };

  // The chat window's top and bottom bars: frosted over the wallpaper.
  const bar = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: { xs: 2, md: 3 },
    py: 1.25,
    bgcolor: (th: Theme) => alpha(th.palette.background.paper, 0.7),
    backdropFilter: "blur(6px)",
  } as const;
  const avatarSx = {
    width: 40,
    height: 40,
    p: "5px",
    boxSizing: "border-box",
    borderRadius: "50%",
    bgcolor: "#fbf7ef", // light in both modes, so the olive logo shows
    flexShrink: 0,
  } as const;

  // Sanad's side of the thread (the end side): a bubble, then the logo in a circle.
  const reply = (key: string, content: ReactNode, label?: string) => (
    <Box
      key={key}
      sx={{
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: "flex-end",
        gap: 1.25,
        alignSelf: "flex-end",
        maxWidth: { xs: "92%", md: "78%" },
        "@keyframes faqPop": {
          from: { opacity: 0, transform: "translateY(6px) scale(0.97)" },
          to: { opacity: 1, transform: "none" },
        },
        animation: "faqPop 220ms ease-out",
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      <Box component="img" src="/favicon.png?v=3" alt="" sx={avatarSx} />
      <Box
        aria-label={label}
        sx={{
          bgcolor: "action.selected",
          color: "primary.dark",
          px: 2.75,
          py: 1.75,
          borderRadius: "18px 18px 4px 18px",
          fontSize: "1.2rem",
          lineHeight: 1.6,
        }}
      >
        {content}
      </Box>
    </Box>
  );

  // Three honey dots that rise one after the other.
  const dots = (
    <Box sx={{ display: "flex", gap: 0.75, py: 0.75 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: "warning.main",
            "@keyframes faqDot": {
              "0%, 60%, 100%": { transform: "none", opacity: 0.5 },
              "30%": { transform: "translateY(-4px)", opacity: 1 },
            },
            animation: `faqDot 900ms ${i * 150}ms infinite ease-in-out`,
          }}
        />
      ))}
    </Box>
  );

  return (
    <LandingSection id="faq" title={t("landing.faq.title")} intro={t("landing.faq.intro")} alignTop>
      {/* The thread sits on a chat wallpaper: faint line drawings from the clinic
          (leaves, dumbbells, a spine, a calendar...), drawn through a mask so their
          colour follows the theme. */}
      <Box
        sx={{
          position: "relative",
          mt: { xs: 2, md: 2.5 },
          borderRadius: "28px",
          // A shade darker than the page, so it reads as a chat window.
          bgcolor: (th) => (th.palette.mode === "light" ? "#ede3d1" : th.palette.background.paper),
          overflow: "hidden",
          minHeight: { md: "calc(100svh - 240px)" },
          display: "flex",
          flexDirection: "column",
          // Short laptop screens: a tighter thread so the section fits one screen.
          "@media (min-width: 900px) and (max-height: 820px)": {
            "& .faq-body": { py: 1.25 },
            "& .faq-thread": { gap: 1 },
            "& .faq-thread .MuiButtonBase-root": { py: 0.75 },
            "& .faq-bar": { py: 0.75 },
            "& .faq-today": { display: "none" },
          },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "primary.main",
            opacity: (th) => (th.palette.mode === "light" ? 0.13 : 0.18),
            maskImage: "url(/images/chat-pattern.png)",
            maskSize: "380px",
            maskRepeat: "repeat",
          }}
        />
        {/* Top bar of the chat: who you are talking to. */}
        <Box
          className="faq-bar"
          sx={{
            ...bar,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box component="img" src="/favicon.png?v=3" alt="" sx={avatarSx} />
          <Box>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t("brand.name")}</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <Box
                component="span"
                sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }}
              />
              {t("landing.faq.status")}
            </Typography>
          </Box>
        </Box>

        <Box
          className="faq-body"
          sx={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 2, md: 5 },
            py: { xs: 3, md: 2.5 },
          }}
        >
          {/* A small day label, as at the top of a conversation. */}
          <Box
            className="faq-today"
            sx={{
              alignSelf: "center",
              mb: 2,
              px: 1.5,
              py: 0.25,
              borderRadius: 2,
              bgcolor: "background.paper",
              color: "text.secondary",
              fontSize: "0.85rem",
            }}
          >
            {t("landing.faq.today")}
          </Box>
          <Box
            className="faq-thread"
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 860,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2.25,
            }}
          >
            {questions.map((n) => {
              const isOpen = open === n;
              return (
                <Box key={n} sx={{ display: "contents" }}>
                  <ButtonBase
                    onClick={() => ask(n)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${n}`}
                    sx={{
                      // The visitor's side of the thread (the start side).
                      alignSelf: "flex-start",
                      maxWidth: { xs: "88%", md: "70%" },
                      textAlign: "start",
                      px: 2.75,
                      py: 1.6,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: isOpen ? "primary.main" : "divider",
                      borderRadius: "18px 18px 18px 4px",
                      fontFamily: "inherit",
                      fontSize: "1.2rem",
                      color: "text.primary",
                      transition: "border-color 150ms",
                      "&:hover": { borderColor: "primary.main" },
                      "&.Mui-focusVisible": {
                        outline: 2,
                        outlineColor: "primary.main",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Typography component="h3" sx={{ font: "inherit" }}>
                      {t(`landing.faq.q${n}`)}
                    </Typography>
                  </ButtonBase>
                  <Box id={`faq-answer-${n}`} aria-live="polite" sx={{ display: "contents" }}>
                    {isOpen &&
                      (typing
                        ? reply("typing", dots, t("landing.faq.typing"))
                        : reply("answer", t(`landing.faq.a${n}`)))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Bottom bar: looks like the message box, and takes the visitor to the
            contact details to ask anything else. */}
        <Box className="faq-bar" sx={{ ...bar, borderTop: 1, borderColor: "divider" }}>
          <ButtonBase
            href="/#contact"
            sx={{
              flex: 1,
              justifyContent: "space-between",
              px: 2.25,
              py: 1.1,
              borderRadius: 999,
              bgcolor: "background.paper",
              color: "text.secondary",
              fontFamily: "inherit",
              fontSize: "1.05rem",
              "&:hover": { color: "primary.dark" },
              "&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main" },
            }}
          >
            {t("landing.faq.more")}
            <Box
              component="span"
              sx={{
                display: "grid",
                placeItems: "center",
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                ms: 2,
              }}
            >
              {/* The paper plane points the way the text runs. */}
              <SendHorizontal size={16} style={isRtl ? { transform: "scaleX(-1)" } : undefined} />
            </Box>
          </ButtonBase>
        </Box>
      </Box>
    </LandingSection>
  );
};
