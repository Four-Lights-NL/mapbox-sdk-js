/// <reference types="node" />

import type * as GeoJSON from "geojson"
import type { Coordinates, MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function TileQuery(config: SdkConfig | MapiClient): TileQueryService

interface TileQueryService {
  listFeatures(request: TileQueryRequest): MapiRequest<GeoJSON.FeatureCollection<GeoJSON.Geometry, TileQueryResponseProperty>>
}

interface TileQueryRequest {
  /**
   * The tileset identifier.
   */
  tilesetId: string
  /**
   * The longitude and latitude to be queried.
   */
  coordinates: Coordinates
  /**
   * The approximate distance in meters to query for features.
   */
  radius?: number | undefined
  /**
   * The number of features to return, between 1-50.
   */
  limit?: number | undefined
  /**
   * Whether to return a simplified response.
   */
  dedupe?: boolean | undefined
  /**
   * Queries for a specific layer in the tileset.
   */
  layers?: string[] | undefined
  /**
   * A query to filter results based on property values.
   */
  query?: Array<{
    property: string
    operator: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "!in"
    value: string | number | boolean | Array<string | number | boolean>
  }> | undefined
  /**
   * Geometry type to filter for.
   */
  geometry?: GeometryType | GeometryType[] | undefined
}

interface TileQueryResponseProperty {
  /**
   * The layer of the queried feature.
   */
  tilequery: {
    /**
     * The layer of the queried feature.
     */
    layer: string
    /**
     * The distance from the queried point, in meters.
     */
    distance: number
    /**
     * The geometry type of the feature.
     */
    geometry: GeometryType
  }
  [key: string]: any
}

type GeometryType = "polygon" | "linestring" | "point"