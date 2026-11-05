import { useEffect, useState, type ReactNode } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LandingSection } from "./LandingSection";

const questions = ["1", "2", "3", "4", "5"] as const;
type Question = (typeof questions)[number];

const TYPING_MS = 700; // how long the clinic "types" before the answer appears

// The questions as a quiet message thread with the clinic: the visitor's questions
// sit on one side as bubbles, and tapping one makes Sanad "type" for a moment and
// answer in a pale olive bubble on the other side. One answer is open at a time;
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

  // Sanad's side of the thread: the logo in a small circle, then a bubble.
  const reply = (key: string, content: ReactNode, label?: string) => (
    <Box
      key={key}
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1.25,
        alignSelf: "flex-start",
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
          bgcolor: "background.paper",
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
          borderRadius: "18px 18px 18px 4px",
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
      <Box
        sx={{
          maxWidth: 860,
          mx: "auto",
          mt: { xs: 2, md: 3 },
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
                  alignSelf: "flex-end",
                  maxWidth: { xs: "88%", md: "70%" },
                  textAlign: "start",
                  px: 2.75,
                  py: 1.6,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: isOpen ? "primary.main" : "divider",
                  borderRadius: "18px 18px 4px 18px",
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
    </LandingSection>
  );
};
