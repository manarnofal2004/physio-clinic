import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, type Location } from "react-router-dom";
import { LoadingState } from "@/components/feedback/LoadingState";
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

  return (
    <Box sx={{ display: "flex", justifyContent: "center", px: 2, py: { xs: 6, md: 10 } }}>
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 420, p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" component="h1">
          {t("login.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
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
          />
          <FormTextField
            name="password"
            control={control}
            type="password"
            label={t("login.password")}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
            {t("login.submit")}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
