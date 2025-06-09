/// <reference types="node" />

import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Tokens(config: SdkConfig | MapiClient): TokensService

interface TokensService {
  /**
   * List your access tokens.
   */
  listTokens(): MapiRequest<Token[]>
  /**
   * Create a new access token.
   */
  createToken(request: CreateTokenRequest): MapiRequest<Token>
  /**
   * Create a temporary access token.
   */
  createTemporaryToken(request: TemporaryTokenRequest): MapiRequest<Token>
  /**
   * Update an access token.
   */
  updateToken(config: {
    tokenId: string
    note?: string | undefined
    scopes?: string[] | undefined
    resources?: string[] | undefined
    referrers?: string[] | undefined
  }): MapiRequest<Token>
  /**
   * Get data about the access token used to make the request.
   */
  getToken(): MapiRequest<TokenDetail>
  /**
   * Delete an access token.
   */
  deleteToken(config: { tokenId: string }): MapiRequest
  /**
   * List your available scopes.
   */
  listScopes(): MapiRequest<Scope[]>
}

interface Token {
  /**
   * The identifier for the token.
   */
  id: string
  /**
   * The type of token.
   */
  usage: "pk" | "sk" | "tk"
  /**
   * The access token itself.
   */
  token: string
  /**
   * A human readable description of the token.
   */
  note?: string | undefined
  /**
   * The scopes that the token has access to.
   */
  scopes: string[]
  /**
   * The date and time the token was created.
   */
  created: string
  /**
   * The date and time the token was last modified.
   */
  modified: string
  /**
   * Authorized URLs associated with the token.
   */
  referrers?: string[] | undefined
  /**
   * The resources that the token has access to.
   */
  resources?: string[] | undefined
}

interface CreateTokenRequest {
  /**
   * A human readable description of the token.
   */
  note?: string | undefined
  /**
   * The scopes that the token should have access to.
   */
  scopes: string[]
  /**
   * The resources that the token should have access to.
   */
  resources?: string[] | undefined
  /**
   * Authorized URLs associated with the token.
   */
  referrers?: string[] | undefined
}

interface TemporaryTokenRequest {
  /**
   * The scopes that the token should have access to.
   */
  scopes: string[]
  /**
   * The resources that the token should have access to.
   */
  resources?: string[] | undefined
  /**
   * The number of seconds until the token expires.
   */
  expires?: number | undefined
}

interface TokenDetail {
  /**
   * The type of token.
   */
  usage: "pk" | "sk" | "tk"
  /**
   * The identifier for the token.
   */
  id: string
}

interface Scope {
  /**
   * The scope identifier.
   */
  id: string
  /**
   * A description of what the scope allows.
   */
  description: string
}