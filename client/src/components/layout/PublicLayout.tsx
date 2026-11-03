import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { PublicFooter } from "./PublicFooter";
import { PublicNavbar } from "./PublicNavbar";

export const PublicLayout = () => (
  <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <PublicNavbar />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
    <PublicFooter />
  </Box>
);
