import { arSD, enUS } from "@mui/material/locale";
import { createTheme, type Direction, type PaletteMode } from "@mui/material/styles";

// The clinic's look: "olive and stone" colours with a layout inspired by jane.app.
// - stone grey is the "air" (sidebar, tinted areas); one olive green marks everything you can press
// - honey marks waiting states (pending reservations)
// - one font, Redaction, for headings, text and controls (IBM Plex Sans Arabic for Arabic)
// - no boxes: content is grouped by space, type and thin lines, not by bordered or shadowed cards
// - quiet buttons: regular weight, 8px corners
const colors = {
  light: {
    primary: "#4f6a2a",
    primaryDark: "#3a4f1e",
    tint: "#e3ead6", // tinted areas and selected states
    wash: "#f5eee3", // light beige: the page background, hero, services, admin sidebar
    paper: "#ffffff", // cards, menus and dialogs stay white on the beige
    text: "#1f2a1a",
    textMuted: "#5d6656",
    line: "#d9ddd2",
    warning: "#9a6b1f", // pending and waiting states
    panel: "#5f7a45", // softer olive for large coloured panels (services)
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
    panel: "#2e3a22",
  },
} as const;

// Adds the stone "wash" colour to the palette, used as bgcolor: "background.wash".
declare module "@mui/material/styles" {
  interface TypeBackground {
    wash: string;
    panel: string;
  }
}

// Redaction has no Arabic letters, so Arabic text falls back to IBM Plex Sans Arabic.
const font = '"Redaction", "IBM Plex Sans Arabic", serif';

export const createAppTheme = (
  mode: PaletteMode,
  direction: Direction = "ltr",
  language = "en",
) => {
  const c = colors[mode];
  const heading = (fontSize: string) => ({
    fontWeight: 400,
    fontSize,
    // Arabic letters join, so they need more line height and no negative tracking.
    lineHeight: direction === "rtl" ? 1.3 : 1.15,
    letterSpacing: direction === "rtl" ? 0 : "-0.01em",
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
        background: {
          default: mode === "light" ? c.wash : c.paper,
          paper: c.paper,
          wash: c.wash,
          panel: c.panel,
        },
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
        // Depth is kept for things that float above the page (dialogs, menus). An
        // outlined Paper (used to wrap tables) is a calm sheet: white on the beige page,
        // rounded, with a hairline frame and no shadow.
        MuiPaper: {
          styleOverrides: {
            outlined: {
              border: `1px solid ${c.line}`,
              borderRadius: 16,
              backgroundColor: c.paper,
              overflow: "hidden",
            },
          },
        },
        // Dialogs: softer corners, a calm olive title and room around the buttons.
        MuiDialog: {
          styleOverrides: { paper: { borderRadius: 20, backgroundImage: "none" } },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: { fontSize: "1.35rem", fontWeight: 600, color: c.primaryDark, paddingTop: 22 },
          },
        },
        MuiDialogActions: {
          styleOverrides: { root: { padding: "8px 24px 20px", gap: 4 } },
        },
        // Fields are white on the beige page, so they read as places to type.
        MuiOutlinedInput: {
          styleOverrides: {
            root: { backgroundColor: c.paper, borderRadius: 10 },
            notchedOutline: { borderColor: c.line },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              borderColor: c.line,
              color: c.textMuted,
              "&.Mui-selected": { backgroundColor: c.tint, color: c.primaryDark, fontWeight: 600 },
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: c.primaryDark,
              color: mode === "light" ? c.wash : c.text,
              fontSize: "0.8rem",
            },
          },
        },
        // Notifications in the clinic's colours instead of Material's bright green and blue.
        MuiAlert: {
          styleOverrides: {
            root: {
              variants: [
                {
                  props: { variant: "filled", severity: "success" },
                  style: { backgroundColor: c.primary, color: mode === "light" ? "#fff" : c.wash },
                },
                {
                  props: { variant: "filled", severity: "info" },
                  style: {
                    backgroundColor: c.primaryDark,
                    color: mode === "light" ? "#fff" : c.wash,
                  },
                },
              ],
            },
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
        // Tables: a pale olive header row, soft lines, and a tint on the row under the
        // pointer.
        MuiTableCell: {
          styleOverrides: {
            root: { borderBottom: `1px solid ${c.line}`, paddingTop: 14, paddingBottom: 14 },
            head: {
              backgroundColor: mode === "light" ? "#eef1e7" : c.tint,
              color: c.primaryDark,
              fontWeight: 700,
              fontSize: "0.85rem",
              paddingTop: 12,
              paddingBottom: 12,
              borderBottom: `1px solid ${c.line}`,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              "&:last-of-type td": { borderBottom: 0 },
              "&.MuiTableRow-hover:hover": {
                backgroundColor:
                  mode === "light" ? "rgba(79, 106, 42, 0.04)" : "rgba(169, 194, 122, 0.06)",
              },
            },
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
