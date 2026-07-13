import { env } from '@/lib/env';

const PKCE_VERIFIER_KEY = 'whereis:keycloak:pkce_verifier';
const PKCE_STATE_KEY = 'whereis:keycloak:pkce_state';

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface KeycloakSessionTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: string;
}

function getRealmBaseUrl() {
  if (!env.keycloakBaseUrl || !env.keycloakRealm) {
    throw new Error('Keycloak is not configured.');
  }

  return `${env.keycloakBaseUrl.replace(/\/+$/, '')}/realms/${encodeURIComponent(env.keycloakRealm)}`;
}

function getRedirectUri() {
  if (env.keycloakRedirectUri) {
    return env.keycloakRedirectUri;
  }

  return `${window.location.origin}/auth/callback`;
}

function getLogoutRedirectUri() {
  return `${window.location.origin}/login`;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function randomValue(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createCodeChallenge(verifier: string) {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toBase64Url(new Uint8Array(digest));
}

async function exchangeToken(params: URLSearchParams): Promise<KeycloakTokenResponse> {
  const response = await fetch(`${getRealmBaseUrl()}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Keycloak token exchange failed (${response.status})`);
  }

  return response.json() as Promise<KeycloakTokenResponse>;
}

function getStoredPkceVerifier(state: string) {
  const storedState = sessionStorage.getItem(PKCE_STATE_KEY);
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

  if (!verifier || storedState !== state) {
    throw new Error('Invalid Keycloak callback state.');
  }

  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);

  return verifier;
}

export async function redirectToKeycloakLogin() {
  window.location.assign(await buildResolvedKeycloakAuthUrl());
}

export async function buildResolvedKeycloakAuthUrl() {
  if (!env.keycloakClientId) {
    throw new Error('Keycloak client is not configured.');
  }

  const redirectUri = getRedirectUri();
  const state = randomValue();
  const nonce = randomValue();
  const verifier = randomValue(96);
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(PKCE_STATE_KEY, state);
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id: env.keycloakClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  return `${getRealmBaseUrl()}/protocol/openid-connect/auth?${params.toString()}`;
}

export async function exchangeKeycloakAuthorizationCode(code: string, state: string): Promise<KeycloakSessionTokens> {
  if (!env.keycloakClientId) {
    throw new Error('Keycloak client is not configured.');
  }

  const verifier = getStoredPkceVerifier(state);
  const tokenResponse = await exchangeToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.keycloakClientId,
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: verifier,
    }),
  );

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    idToken: tokenResponse.id_token,
    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
  };
}

export async function refreshKeycloakSession(refreshToken: string): Promise<KeycloakSessionTokens> {
  if (!env.keycloakClientId) {
    throw new Error('Keycloak client is not configured.');
  }

  const tokenResponse = await exchangeToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.keycloakClientId,
      refresh_token: refreshToken,
    }),
  );

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    idToken: tokenResponse.id_token,
    expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
  };
}

export function buildKeycloakLogoutUrl(idTokenHint?: string | null) {
  const params = new URLSearchParams({
    post_logout_redirect_uri: getLogoutRedirectUri(),
  });

  if (idTokenHint) {
    params.set('id_token_hint', idTokenHint);
  }

  return `${getRealmBaseUrl()}/protocol/openid-connect/logout?${params.toString()}`;
}

export function clearKeycloakPkce() {
  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
}
