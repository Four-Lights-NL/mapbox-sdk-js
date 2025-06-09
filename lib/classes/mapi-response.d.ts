/// <reference types="node" />

import type { MapiRequest } from "./mapi-request"

export interface MapiResponse<T = any> {
  /**
   * The response body, parsed as JSON.
   */
  body: T
  /**
   * The raw response body.
   */
  rawBody: string
  /**
   * The response's status code.
   */
  statusCode: number
  /**
   * The parsed response headers.
   */
  headers: any
  /**
   * The parsed response links
   */
  links: any
  /**
   * The response's originating MapiRequest.
   */
  request: MapiRequest<T>
  hasNextPage(): boolean
  nextPage(): MapiRequest<T> | null
}