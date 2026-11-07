import type { ReactNode } from "react";
import { ButtonBase } from "@mui/material";

interface BubbleProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  label?: string;
}

// A pill to pick a day or a time: pale olive, and olive with light text once chosen.
export const Bubble = ({ selected, onClick, children, label }: BubbleProps) => (
  <ButtonBase
    onClick={onClick}
    aria-pressed={selected}
    aria-label={label}
    sx={{
      px: 1.75,
      py: 0.9,
      borderRadius: 999,
      fontFamily: "inherit",
      fontSize: "0.98rem",
      whiteSpace: "nowrap",
      bgcolor: selected ? "primary.main" : "action.selected",
      color: selected ? "primary.contrastText" : "primary.dark",
      transition: "background-color 150ms, color 150ms",
      "&:hover": { bgcolor: selected ? "primary.main" : "action.hover" },
      "&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
    }}
  >
    {children}
  </ButtonBase>
);
