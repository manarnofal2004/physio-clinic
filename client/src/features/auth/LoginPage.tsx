import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, type Location } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
import { SCREEN_HEIGHT } from "@/components/layout/navbarHeight";
import { FormTextField } from "@/components/form/FormTextField";
import type { Translation } from "@/i18n/locales/en";
import { ApiError } from "@/lib/api/apiError";
import { homePathFor } from "./homePath";
import { createLoginSchema, type LoginValues } from "./loginSchema";
import { useAuth } from "./useAuth";

type LoginError = keyof Translation["login"]["errors"];

// Which text to show for an error from the login request.
const loginErrorFor = (error: unknown): LoginError => {
  const code = error instanceof ApiError ? error.code : null;
  switch (code) {
    case "INVALID_CREDENTIALS":
    case "VALIDATION_ERROR": // only a password over the server's limit gets past the form
      return "invalidCredentials";
    case "ACCOUNT_DISABLED":
      return "accountDisabled";
    case "TOO_MANY_REQUESTS":
      return "tooManyRequests";
    case "NETWORK_ERROR":
      return "network";
    default:
      return "unexpected";
  }
};

export const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { user, isLoading, login } = useAuth();
  const location = useLocation();
  const [loginError, setLoginError] = useState<LoginError | null>(null);

  const schema = useMemo(() => createLoginSchema(t), [t]);
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitted, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  // Field messages are made when the form validates, so redo them when the language changes.
  useEffect(() => {
    if (isSubmitted) void trigger();
  }, [i18n.language, isSubmitted, trigger]);

  const onSubmit = async ({ email, password }: LoginValues) => {
    setLoginError(null);
    try {
      await login(email, password);
    } catch (error) {
      setLoginError(loginErrorFor(error));
    }
  };

  if (isLoading) return <LoadingState label={t("common.loading")} />;

  // Covers both a successful login and opening this page while already logged in.
  if (user) {
    const from = (location.state as { from?: Location } | null)?.from;
    return <Navigate to={from ?? homePathFor(user.role)} replace />;
  }

  // The clinic entrance in a pale olive frame beside the form, one screen tall.
  return (
    <Box
      sx={{
        minHeight: { md: SCREEN_HEIGHT },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        alignItems: "center",
        gap: { xs: 4, md: 8 },
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 3 },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          p: "10px",
          borderRadius: "28px",
          bgcolor: "action.selected",
        }}
      >
        <Box
          component="img"
          src="/images/footer/entrance.webp"
          alt={t("login.photoAlt")}
          sx={{
            display: "block",
            width: "100%",
            height: `calc(${SCREEN_HEIGHT} - var(--banner-height, 0px) - 100px)`,
            objectFit: "cover",
            borderRadius: "20px",
          }}
        />
      </Box>

      <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: "primary.dark",
            fontFamily: '"Redaction", "El Messiri", serif',
            fontStyle: "italic",
            "&:lang(ar)": { fontStyle: "normal", fontWeight: 600 },
          }}
        >
          {t("login.title")}
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            mb: 4,
            fontFamily: '"Redaction", "Amiri", serif',
            fontStyle: "italic",
            fontSize: "1.2rem",
            color: "warning.dark",
            "&:lang(ar)": { fontStyle: "normal" },
          }}
        >
          {t("login.subtitle")}
        </Typography>

        <Stack
          component="form"
          noValidate
          spacing={2}
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        >
          {loginError && <Alert severity="error">{t(`login.errors.${loginError}`)}</Alert>}
          <FormTextField
            name="email"
            control={control}
            type="email"
            label={t("login.email")}
            autoComplete="username"
            required
            slotProps={{ htmlInput: { dir: "ltr" } }}
          />
          <FormTextField
            name="password"
            control={control}
            type="password"
            label={t("login.password")}
            autoComplete="current-password"
            required
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            sx={{ py: 1.25 }}
          >
            {t("login.submit")}
          </Button>
        </Stack>

        {/* Visitors do not need an account: send them to the booking form. */}
        <Typography
          color="text.secondary"
          sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}
        >
          {t("login.noAccount")}{" "}
          <Link href="/#booking" underline="hover" sx={{ fontWeight: 700 }}>
            {t("login.bookLink")}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
