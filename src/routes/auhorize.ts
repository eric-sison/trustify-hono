import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "@trustify/db/config/pg";
import { client } from "@trustify/db/schema/clients";
import { HTTPException } from "hono/http-exception";
import { redis } from "@trustify/db/config/redis";
import { oidcConfig } from "../../oidc.config";
import { generateSsId, setLoginSession } from "@trustify/utils/session";
import { setCookie } from "hono/cookie";

export const authorize = new Hono();

authorize.get("/", async (c) => {
  const { client_id, redirect_uri, scope, response_type, state } = c.req.query();

  const client = await getClientDetails(client_id);

  verifyRedirectUri(client.redirectUris, redirect_uri);

  verifyResponseType(client.responseTypes, response_type);

  verifyScope(scope?.split(" "));

  setLoginSession(c, client_id);

  //return c.json({ client });
  return c.redirect(`${Bun.env.ADMIN_HOST}/login?client_id=${client.id}&state=${state}`);
});

async function getClientDetails(clientId: string | undefined) {
  // check if clientId is provided in the url
  if (!clientId) throw new HTTPException(400, { message: "client_id not provided!" });

  try {
    // check if clientId is in the database
    const clients = await db
      .select({
        id: client.id,
        redirectUris: client.redirectUris,
        responseTypes: client.responseTypes,
        scopes: client.scopes,
      })
      .from(client)
      .where(eq(client.id, clientId));

    // throw error if client does not exist
    if (clients.length === 0) {
      throw new HTTPException(500, { message: "client not found!" });
    }

    return clients[0];
  } catch (error) {
    throw new HTTPException(500, { message: "something went wrong!", cause: error });
  }
}

function verifyRedirectUri(urisFromDB: string[], uriFromClient: string | undefined) {
  // check if redirect_uri is provided
  if (!uriFromClient) {
    throw new HTTPException(400, { message: "redirect_uri not provided!" });
  }

  // check if redirect_uri from client request matches of the registered redirect_uris in the database
  const validUris = urisFromDB.filter((uri) => uri.includes(uriFromClient));

  // if it did not match in any of the registered redirect_uris in the database, throw an error
  if (validUris.length === 0) {
    throw new HTTPException(404, { message: "redirect_uri not found!" });
  }
}

function verifyResponseType(responseTypesFromDb: string[], responseTypeFromClient: string | undefined) {
  if (!responseTypeFromClient) {
    throw new HTTPException(400, { message: "response_type not provided!" });
  }

  // check if the response_type from client is supported by the server
  if (!oidcConfig.response_types_supported.includes(responseTypeFromClient)) {
    throw new HTTPException(400, { message: "unsupported response_type" });
  }

  // check if the response_type is one of the allowed types for the client
  if (!responseTypesFromDb.includes(responseTypeFromClient)) {
    throw new HTTPException(400, { message: "invalid response_type" });
  }
}

function verifyScope(scopes: string[] | undefined) {
  // check if scope is provided
  if (!scopes) {
    throw new HTTPException(400, { message: "scope not provided!" });
  }

  // check if openid is included in the scope/s passed by the client
  if (!scopes.includes("openid")) {
    throw new HTTPException(400, { message: "missing required scope: openid" });
  }

  // check for some invalid scopes
  const invalidScopes = scopes.filter((scope) => !oidcConfig.scopes_supported.includes(scope));

  // throw error if invalid scope/s are/is found
  if (invalidScopes.length > 0) {
    throw new HTTPException(400, { message: "unsupported scope" });
  }
}
