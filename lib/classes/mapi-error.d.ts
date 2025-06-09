/// <reference types="node" />

import type { MapiRequest } from "./mapi-request"

export interface MapiError<T = any> {
  /**
   * The errored request.
   */
  request: MapiRequest<T>
  /**
   * The type of error. Usually this is 'HttpError'.
   * If the request was aborted, so the error was not sent from the server, the type will be 'RequestAbortedError'.
   */
  type: string
  /**
   * The numeric status code of the HTTP response
   */
  statusCode?: number | undefined
  /**
   * If the server sent a response body, this property exposes that response, parsed as JSON if possible.
   */
  body?: T
  /**
   * Whatever message could be derived from the call site and HTTP response.
   */
  message?: string | undefined
}