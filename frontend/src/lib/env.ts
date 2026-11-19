const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not set");
}

// OAuth client ID for "Sign in with Google". Without it the Google button is not shown.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

export const env = { apiBaseUrl, googleClientId } as const;
