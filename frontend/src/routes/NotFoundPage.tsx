import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
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
      <Typography variant="h6">{t("notFound.message")}</Typography>
      <Button component={Link} to="/" variant="contained">
        {t("notFound.backHome")}
      </Button>
    </Box>
  );
};
