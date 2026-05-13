import type { User } from "./types";
import { computeInitials } from "./store";

const GOOGLE_TOKEN_STORAGE_KEY = "sanity:google:gmail-token:v1";
const GOOGLE_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface FirebaseIdpResponse {
  localId?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface StoredGoogleToken {
  accessToken: string;
  expiresAt: number;
  scope: string;
}

interface GoogleIdentityServices {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        prompt?: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: unknown) => void;
      }) => {
        requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
      };
      revoke: (accessToken: string, done?: () => void) => void;
      hasGrantedAllScopes: (tokenResponse: GoogleTokenResponse, ...scopes: string[]) => boolean;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

export function getStoredGoogleToken(): StoredGoogleToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredGoogleToken;
    if (!parsed.accessToken || parsed.expiresAt <= Date.now() + 60_000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredGoogleToken() {
  if (typeof window === "undefined") return;
  const token = getStoredGoogleToken();
  try {
    sessionStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
    if (token?.accessToken && window.google?.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(token.accessToken);
    }
  } catch {}
}

function storeGoogleToken(token: StoredGoogleToken) {
  try {
    sessionStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, JSON.stringify(token));
  } catch {}
}

function loadGoogleIdentityServices() {
  if (window.google?.accounts.oauth2) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });
}

function requestGoogleAccessToken(clientId: string) {
  return new Promise<GoogleTokenResponse>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Google sign-in was cancelled or timed out."));
    }, 120_000);

    loadGoogleIdentityServices()
      .then(() => {
        const tokenClient = window.google?.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPE,
          prompt: "consent",
          callback: (response) => {
            window.clearTimeout(timeout);
            resolve(response);
          },
          error_callback: (error) => {
            window.clearTimeout(timeout);
            reject(error);
          },
        });

        if (!tokenClient) {
          window.clearTimeout(timeout);
          reject(new Error("Google sign-in is unavailable."));
          return;
        }

        tokenClient.requestAccessToken({ prompt: "consent" });
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });
}

async function signInToFirebaseWithGoogle(accessToken: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postBody: `access_token=${encodeURIComponent(accessToken)}&providerId=google.com`,
        requestUri: window.location.origin,
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    }
  );

  const payload = (await response.json()) as FirebaseIdpResponse & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Firebase authentication failed.");
  }
  return payload;
}

export async function signInWithGoogleAndFirebase(): Promise<{ user: User; token: StoredGoogleToken }> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
  }

  const googleToken = await requestGoogleAccessToken(clientId);
  if (googleToken.error || !googleToken.access_token) {
    throw new Error(googleToken.error_description ?? googleToken.error ?? "Google sign-in failed.");
  }

  const grantedGmail = window.google?.accounts.oauth2.hasGrantedAllScopes(
    googleToken,
    "https://www.googleapis.com/auth/gmail.readonly"
  );
  if (!grantedGmail) {
    throw new Error("Gmail read access is required to scan receipts.");
  }

  const firebaseUser = await signInToFirebaseWithGoogle(googleToken.access_token);
  const displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Google user";
  const email = firebaseUser.email || "google-user@example.com";

  const token: StoredGoogleToken = {
    accessToken: googleToken.access_token,
    expiresAt: Date.now() + Math.max(0, googleToken.expires_in ?? 3600) * 1000,
    scope: googleToken.scope ?? GOOGLE_SCOPE,
  };
  storeGoogleToken(token);

  return {
    user: {
      id: firebaseUser.localId ?? "firebase_google_user",
      name: displayName,
      email,
      initials: computeInitials(displayName),
    },
    token,
  };
}
