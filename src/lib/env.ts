export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  keycloakBaseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL ?? '',
  keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM ?? '',
  keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? '',
  keycloakRedirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI ?? '',
} as const;
