import { useEffect, useState, type ReactNode } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
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
      <Box
        component="img"
        src="/favicon.png?v=3"
        alt=""
        sx={{
          width: 40,
          height: 40,
          p: "5px",
          boxSizing: "border-box",
          borderRadius: "50%",
          bgcolor: "#fbf7ef", // light in both modes, so the olive logo shows
          flexShrink: 0,
        }}
      />
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
          alignItems: "center",
          px: { xs: 2, md: 5 },
          py: { xs: 3, md: 3.5 },
          // Short laptop screens: a tighter thread so the section fits one screen.
          "@media (min-width: 900px) and (max-height: 760px)": {
            py: 2,
            "& .faq-thread": { gap: 1.25 },
            "& .faq-thread .MuiButtonBase-root": { py: 1 },
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
    </LandingSection>
  );
};
