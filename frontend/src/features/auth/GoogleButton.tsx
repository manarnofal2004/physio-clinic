import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { env } from "@/lib/env";

// The parts of Google's sign-in script we use (https://accounts.google.com/gsi/client).
interface GoogleIdentity {
  initialize: (options: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

// Google's script loads once, the first time the button is shown.
let scriptLoading: Promise<void> | null = null;
const loadGoogleScript = () =>
  (scriptLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoading = null; // let a later visit try again
      reject(new Error("Google sign-in could not load"));
    };
    document.head.append(script);
  }));

// Google's own "Sign in with Google" button, in the page language and colour mode.
// Google draws it (its rules do not allow a home-made one). Once the person picks
// their account, onCredential gets the ID token to send to the server. Nothing shows
// when the site has no Google client ID or Google cannot be reached.
export const GoogleButton = ({ onCredential }: { onCredential: (credential: string) => void }) => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    latest.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const clientId = env.googleClientId;
    if (!clientId) return;
    let alive = true;
    loadGoogleScript()
      .then(() => {
        const parent = box.current;
        const google = window.google?.accounts.id;
        if (!alive || !parent || !google) return;
        google.initialize({
          client_id: clientId,
          callback: ({ credential }) => latest.current(credential),
        });
        parent.replaceChildren(); // drawn again when the language or mode changes
        google.renderButton(parent, {
          type: "standard",
          theme: theme.palette.mode === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "rectangular", // square-ish corners like the site's buttons
          text: "continue_with",
          logo_alignment: "center",
          locale: i18n.language,
          width: Math.min(parent.clientWidth || 320, 400),
        });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [i18n.language, theme.palette.mode]);

  if (!env.googleClientId || failed) return null;
  return <Box ref={box} sx={{ display: "flex", justifyContent: "center", minHeight: 44 }} />;
};
