/// <reference types="node" />

declare module "@mapbox/mapbox-sdk" {
  import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
  import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

  export default function createNodeClient(config: SdkConfig): MapiClient
}
