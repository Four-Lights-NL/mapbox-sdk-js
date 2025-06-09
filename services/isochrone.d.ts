/// <reference types="node" />

import type * as GeoJSON from "geojson"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"

export default function Isochrone(config: SdkConfig | MapiClient): IsochroneService

interface IsochroneService {
  getContours(
    request: IsochroneRequest<false | undefined>,
  ): MapiRequest<GeoJSON.FeatureCollection<GeoJSON.Polygon>>
  getContours(request: IsochroneRequest<true>): MapiRequest<GeoJSON.FeatureCollection<GeoJSON.MultiPolygon>>
}

interface IsochroneDistance {
  /**
   * A GeoJSON Point feature that will be used as the starting point for the isochrone.
   */
  coordinates: [number, number]
  /**
   * Distances to use for each isochrone contour, in meters. You can specify up to 4 contours.
   */
  contours_meters: number[]
  /**
   * Routing profile. mapbox/driving (default), mapbox/walking, or mapbox/cycling.
   */
  profile?: "driving" | "walking" | "cycling" | undefined
}

interface IsochroneTime {
  /**
   * A GeoJSON Point feature that will be used as the starting point for the isochrone.
   */
  coordinates: [number, number]
  /**
   * Times to use for each isochrone contour, in minutes. You can specify up to 4 contours.
   */
  contours_minutes: number[]
  /**
   * Routing profile. mapbox/driving (default), mapbox/walking, or mapbox/cycling.
   */
  profile?: "driving" | "walking" | "cycling" | undefined
}

type IsochroneRequest<T extends boolean | undefined = false> = (IsochroneDistance | IsochroneTime) & {
  /**
   * Whether to return the contours as GeoJSON polygons (true) or linestrings (false, default).
   */
  polygons?: T
  /**
   * Whether to return additional metadata about each isochrone contour.
   */
  denoise?: number | undefined
  /**
   * Whether to return additional metadata about each isochrone contour.
   */
  generalize?: number | undefined
}