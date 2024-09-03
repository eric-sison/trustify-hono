export const oidcConfig = {
  issuer: Bun.env.ISSUER,
  authorization_endpoint: Bun.env.AUTHORIZATION_ENPOINT,
  token_endpoint: Bun.env.TOKEN_ENDPOINT,
  userinfo_endpoint: Bun.env.USERINFO_ENDPOINT,
  jwks_uri: Bun.env.JWKS_URI,
  response_types_supported: ["code"],
  scopes_supported: ["openid", "profile"],
  subject_types_supported: ["public", "pairwise"],
  id_token_signing_alg_values_supported: ["RS256"],
};
