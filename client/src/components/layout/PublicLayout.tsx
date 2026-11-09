import { Box } from "@mui/material";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { AnnouncementBar } from "@/features/banners/AnnouncementBar";
import { PublicFooter } from "./PublicFooter";
import { PublicNavbar } from "./PublicNavbar";

export const PublicLayout = () => (
  <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    {/* A new page starts at the top (links to "/#section" still scroll to it). */}
    <ScrollRestoration />
    {/* Above the sticky navbar, so it scrolls away with the page. */}
    <AnnouncementBar />
    <PublicNavbar />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
    <PublicFooter />
  </Box>
);
