/// <reference types="node" />

import type { MapiResponse } from "./mapi-response"
import type MapiClient from "./mapi-client"
import type { MapiError } from "./mapi-error"

interface EventEmitter<T> {
  response: MapiResponse<T>
  error: MapiError<T>
  downloadProgress: ProgressEvent
  uploadProgress: ProgressEvent
}

export interface MapiRequestOptions {
  /**
   * The request's path, including colon-prefixed route parameters.
   */
  path: string
  /**
   * The request's origin.
   */
  origin: string
  /**
   * The request's HTTP method.
   */
  method: string
  /**
   * A query object, which will be transformed into a URL query string.
   */
  query: any
  /**
   * A route parameters object, whose values will be interpolated the path.
   */
  params: any
  /**
   * The request's headers.
   */
  headers: any
  /**
   * Data to send with the request. If the request has a body, it will also be sent with the header 'Content-Type: application/json'.
   */
  body?: any
  /**
   * A file to send with the request. The browser client accepts Blobs and ArrayBuffers.
   */
  file: Blob | ArrayBuffer | string | NodeJS.ReadStream
  /**
   * The encoding of the response.
   */
  encoding: string
  /**
   * The method to send the `file`. Options are `data` (x-www-form-urlencoded) or `form` (multipart/form-data)
   */
  sendFileAs: "data" | "form"
}

export type MapiRequest<T = any> = MapiRequestOptions & {
  /**
   * An event emitter.
   */
  emitter: EventEmitter<T>
  /**
   * This request's MapiClient.
   */
  client: MapiClient
  /**
   * If this request has been sent and received a response, the response is available on this property.
   */
  response?: MapiResponse<T> | undefined
  /**
   * If this request has been sent and received an error in response, the error is available on this property.
   */
  error?: MapiError<T> | Error | undefined
  /**
   * If the request has been aborted (via abort), this property will be true.
   */
  aborted: boolean
  /**
   * If the request has been sent, this property will be true.
   * You cannot send the same request twice, so if you need to create a new request
   * that is the equivalent of an existing one, use clone.
   */
  sent: boolean
  url(accessToken?: string): string
  send(): Promise<MapiResponse<T>>
  abort(): void
  eachPage(callback: PageCallbackFunction<T>): void
  clone(): MapiRequest<T>
}

export interface PageCallbackFunction<T> {
  error: MapiError<T>
  response: MapiResponse<T>
  next: () => void
}

export type Coordinates = [number, number]

export type MapboxProfile = "driving" | "walking" | "cycling" | "driving-traffic"

export type DirectionsApproach = "unrestricted" | "curb"