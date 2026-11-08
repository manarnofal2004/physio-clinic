import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
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
  const theme = useTheme();
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

  // The clinic's open door fills the screen; the form sits on a sheet of torn paper
  // pinned beside it, like a note by the entrance, with a handwritten welcome.
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: "auto", md: `calc(${SCREEN_HEIGHT} - var(--banner-height, 0px))` },
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "center", md: "flex-end" },
        px: { xs: 2, md: 8 },
        py: { xs: 4, md: 3 },
        overflow: "hidden",
      }}
    >
      {/* The door is on the photo's left and a quiet wall on its right, where the
          note sits. In Arabic the note moves to the left, so the photo is mirrored. */}
      <Box
        component="img"
        src="/images/login-door.webp?v=2"
        alt=""
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: theme.direction === "rtl" ? "scaleX(-1)" : "none",
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          filter: "drop-shadow(0 18px 30px rgba(40, 30, 10, 0.35))",
        }}
      >
        <Box
          sx={{
            backgroundImage: `url(/images/${theme.palette.mode === "light" ? "paper" : "paper-dark"}.webp)`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            px: { xs: 3.5, md: 6 },
            pt: { xs: 5, md: 6 },
            pb: { xs: 5, md: 6 },
            // Short laptop screens: a shorter note so it fits one screen.
            "@media (min-width: 900px) and (max-height: 700px)": {
              pt: 3,
              pb: 3,
              "& img": { height: 40 },
              "& h1": { fontSize: "2.2rem" },
              "& .login-subtitle": { mb: 2 },
              "& .login-book": { mt: 2, pt: 1.5 },
            },
          }}
        >
          <Box
            component="img"
            src={theme.palette.mode === "light" ? "/logo-full.png?v=3" : "/logo-full-dark.png?v=3"}
            alt=""
            sx={{ display: "block", height: 54, mx: "auto" }}
          />
          <Box
            component="p"
            sx={{
              m: 0,
              mt: 1.5,
              textAlign: "center",
              fontFamily: '"Caveat", "Aref Ruqaa", cursive',
              fontSize: "1.9rem",
              color: "warning.main",
            }}
          >
            {t("login.welcome")}
          </Box>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              textAlign: "center",
              color: "primary.dark",
              fontFamily: '"Redaction", "El Messiri", serif',
              fontStyle: "italic",
              "&:lang(ar)": { fontStyle: "normal", fontWeight: 600 },
            }}
          >
            {t("login.title")}
          </Typography>
          <Typography
            className="login-subtitle"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 0.5, mb: 3 }}
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
            className="login-book"
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
    </Box>
  );
};
