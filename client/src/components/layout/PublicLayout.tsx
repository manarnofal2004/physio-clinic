import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

export const PublicLayout = () => (
  <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
  </Box>
);
