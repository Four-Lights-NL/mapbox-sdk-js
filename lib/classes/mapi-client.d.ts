/// <reference types="node" />

import type { MapiRequest, MapiRequestOptions } from "./mapi-request"

export default class MapiClient {
  constructor(config: SdkConfig)
  accessToken: string
  origin?: string | undefined
  createRequest(requestOptions: MapiRequestOptions): MapiRequest
}

export interface SdkConfig {
  accessToken: string
  origin?: string | undefined
}