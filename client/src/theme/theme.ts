import { arSD, enUS } from "@mui/material/locale";
import { createTheme, type Direction, type PaletteMode } from "@mui/material/styles";

// The clinic's look: "olive and stone" colours with a layout inspired by jane.app.
// - stone grey is the "air" (sidebar, tinted areas); one olive green marks everything you can press
// - honey marks waiting states (pending reservations)
// - one font, Tajawal (Arabic and Latin), for headings, text and controls
// - no boxes: content is grouped by space, type and thin lines, not by bordered or shadowed cards
// - quiet buttons: regular weight, 8px corners
const colors = {
  light: {
    primary: "#4f6a2a",
    primaryDark: "#3a4f1e",
    tint: "#e3ead6", // tinted areas and selected states
    wash: "#eef0ea", // sidebar and page-level tint
    paper: "#ffffff",
    text: "#1f2a1a",
    textMuted: "#5d6656",
    line: "#d9ddd2",
    warning: "#9a6b1f", // pending and waiting states
  },
  dark: {
    primary: "#a9c27a",
    primaryDark: "#8ea85f",
    tint: "#26301b",
    wash: "#12160f",
    paper: "#1b2117",
    text: "#e7ecdf",
    textMuted: "#a3ad98",
    line: "#2c3426",
    warning: "#e0b45f",
  },
} as const;

const font = '"Tajawal", system-ui, sans-serif';

export const createAppTheme = (
  mode: PaletteMode,
  direction: Direction = "ltr",
  language = "en",
) => {
  const c = colors[mode];
  const heading = (fontSize: string) => ({
    fontWeight: 500,
    fontSize,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
  });

  // The second argument translates MUI's own texts (e.g. "Rows per page" in tables).
  return createTheme(
    {
      direction,
      palette: {
        mode,
        primary: { main: c.primary, dark: c.primaryDark },
        secondary: { main: c.primaryDark },
        warning: { main: c.warning },
        background: { default: c.paper, paper: c.paper },
        text: { primary: c.text, secondary: c.textMuted },
        divider: c.line,
        action: {
          selected: c.tint,
          hover: mode === "light" ? "rgba(79, 106, 42, 0.06)" : "rgba(169, 194, 122, 0.08)",
        },
      },
      shape: { borderRadius: 8 },
      typography: {
        fontFamily: font,
        h1: heading("2.75rem"),
        h2: heading("2.25rem"),
        h3: heading("1.85rem"),
        h4: heading("1.5rem"),
        h5: { fontWeight: 700, fontSize: "1.15rem" },
        h6: { fontWeight: 700, fontSize: "1rem" },
        button: { textTransform: "none", fontWeight: 400, letterSpacing: 0, fontSize: "1rem" },
      },
      components: {
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: { root: { paddingInline: 16 } },
        },
        MuiAppBar: { defaultProps: { elevation: 0, color: "inherit" } },
        // Depth is kept for things that float above the page (dialogs, menus); content
        // panels stay flat. An outlined Paper (used to wrap tables) loses its frame.
        MuiPaper: {
          styleOverrides: {
            outlined: { border: 0, borderRadius: 0, backgroundColor: "transparent" },
          },
        },
        // A card is a single object you act on (one appointment, one report): a tinted
        // field with 16px corners, no border and no shadow.
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: { root: { backgroundColor: c.tint, borderRadius: 16 } },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: c.wash,
              borderInlineEnd: 0,
              "&.MuiDrawer-paperAnchorDockedLeft, &.MuiDrawer-paperAnchorDockedRight": {
                border: 0,
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: { borderBottom: `1px solid ${c.line}` },
            head: { color: c.textMuted, fontWeight: 500, borderBottom: `1px solid ${c.text}` },
          },
        },
        MuiChip: {
          styleOverrides: { root: { fontWeight: 500, borderRadius: 999 } },
        },
        MuiListItemButton: {
          styleOverrides: { root: { borderRadius: 8 } },
        },
      },
    },
    language === "ar" ? arSD : enUS,
  );
};
