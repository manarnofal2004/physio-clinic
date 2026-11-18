import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AnnouncementBar } from "@/features/banners/AnnouncementBar";
import { PublicFooter } from "./PublicFooter";
import { PublicNavbar } from "./PublicNavbar";
import { useScrollToHash } from "./useScrollToHash";

export const PublicLayout = () => {
  // A new page starts at the top; "/#section" links open that section.
  useScrollToHash();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Above the sticky navbar, so it scrolls away with the page. */}
      <AnnouncementBar />
      <PublicNavbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <PublicFooter />
    </Box>
  );
};
