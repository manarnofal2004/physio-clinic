import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

// Sections of the landing page (6.8 and 6.9 give them these ids).
// Labels move to translation keys in 1.8.
const sections = [
  { id: "services", label: "Services" },
  { id: "how-it-works", label: "How it works" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

const BOOKING_ID = "booking";

export const PublicNavbar = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = (
    <Link
      component={RouterLink}
      to="/"
      underline="none"
      color="inherit"
      sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
    >
      <Box component="img" src="/logo-mark.png" alt="" sx={{ width: 40, height: 40 }} />
      <Typography
        component="span"
        sx={{ fontSize: "1.35rem", fontWeight: 700, color: "primary.main" }}
      >
        Sanad
      </Typography>
    </Link>
  );

  const bookButton = (
    <Button variant="contained" href={`/#${BOOKING_ID}`} onClick={() => setMenuOpen(false)}>
      Book a session
    </Button>
  );

  const loginButton = (
    <Button component={RouterLink} to="/login" color="inherit" onClick={() => setMenuOpen(false)}>
      Log in
    </Button>
  );

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.default" }}
    >
      <Toolbar
        sx={{ maxWidth: 1200, width: "100%", mx: "auto", gap: 3, minHeight: { xs: 64, md: 72 } }}
      >
        {brand}

        {isDesktop && (
          <Stack
            component="nav"
            aria-label="Page sections"
            direction="row"
            spacing={3}
            sx={{ mx: "auto" }}
          >
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/#${section.id}`}
                underline="none"
                color="text.secondary"
                sx={{ "&:hover": { color: "primary.main" } }}
              >
                {section.label}
              </Link>
            ))}
          </Stack>
        )}

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", marginInlineStart: "auto" }}>
          <ThemeToggle />
          {isDesktop && loginButton}
          {isDesktop && bookButton}
          {!isDesktop && (
            <IconButton edge="end" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
        </Stack>
      </Toolbar>

      {/* Mobile: the same links and actions in a side panel. */}
      <Drawer
        anchor={theme.direction === "rtl" ? "left" : "right"}
        open={!isDesktop && menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{ paper: { sx: { width: 280, p: 2 } } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          {brand}
          <IconButton onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Stack>
        <List component="nav" aria-label="Page sections">
          {sections.map((section) => (
            <ListItemButton
              key={section.id}
              component="a"
              href={`/#${section.id}`}
              onClick={() => setMenuOpen(false)}
            >
              <ListItemText primary={section.label} />
            </ListItemButton>
          ))}
        </List>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {bookButton}
          {loginButton}
        </Stack>
      </Drawer>
    </AppBar>
  );
};
