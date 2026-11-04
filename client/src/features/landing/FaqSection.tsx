import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LandingSection, SectionTitle } from "./LandingSection";

const questions = ["1", "2", "3", "4", "5"] as const;

// Questions in a quiet list split by hairlines: the heading stays on the side on
// wide screens, and one answer opens at a time.
export const FaqSection = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | false>(false);

  return (
    <LandingSection id="faq">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: { xs: 3, md: 8 },
          alignItems: "start",
        }}
      >
        <Box sx={{ position: { md: "sticky" }, top: 96 }}>
          <SectionTitle id="faq-title">{t("landing.faq.title")}</SectionTitle>
        </Box>

        <Box role="list" aria-labelledby="faq-title">
          {questions.map((n) => (
            <Accordion
              key={n}
              role="listitem"
              disableGutters
              elevation={0}
              square
              expanded={open === n}
              onChange={(_, isOpen) => setOpen(isOpen ? n : false)}
              sx={{
                bgcolor: "transparent",
                borderTop: 1,
                borderColor: "divider",
                "&:last-of-type": { borderBottom: 1, borderColor: "divider" },
                "&::before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<Plus />}
                sx={{
                  px: 0,
                  py: 1,
                  "& .MuiAccordionSummary-content": { my: 1.5 },
                  // The plus turns into a cross when the answer is open.
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                    transform: "rotate(45deg)",
                  },
                }}
              >
                <Typography component="h3" sx={{ fontSize: "1.2rem" }}>
                  {t(`landing.faq.q${n}`)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
                <Typography color="text.secondary" sx={{ maxWidth: 620, lineHeight: 1.7 }}>
                  {t(`landing.faq.a${n}`)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </LandingSection>
  );
};
