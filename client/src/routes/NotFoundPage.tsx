import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      p: 3,
      textAlign: "center",
    }}
  >
    <Typography variant="h2" component="h1" color="primary">
      404
    </Typography>
    <Typography variant="h6">This page could not be found.</Typography>
    <Button component={Link} to="/" variant="contained">
      Back to home
    </Button>
  </Box>
);
