/// <reference types="node" />

import type * as GeoJSON from "geojson"
import type { Coordinates, MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Static(config: SdkConfig | MapiClient): StaticMapService

interface StaticMapService {
  getStaticImage(request: StaticMapRequest): MapiRequest<ArrayBuffer>
}

interface StaticMapRequest {
  /**
   * Map ID of the tileset from which to create a static map.
   */
  ownerId: string
  /**
   * Map ID of the tileset from which to create a static map.
   */
  styleId: string
  /**
   * Width of the image between 1 and 1280 pixels.
   */
  width: number
  /**
   * Height of the image between 1 and 1280 pixels.
   */
  height: number
  /**
   * Denotes the zoom level; a number between 0 and 22. Fractional zoom levels are OK.
   */
  zoom?: number | undefined
  /**
   * Longitude for the center point of the static map; a number between -180 and 180.
   */
  lon?: number | undefined
  /**
   * Latitude for the center point of the static map; a number between -85.0511 and 85.0511.
   */
  lat?: number | undefined
  /**
   * Bearing rotates the map around its center. A number between 0 and 360, interpreted as decimal degrees.
   */
  bearing?: number | undefined
  /**
   * Pitch tilts the map, producing a perspective effect. A number between 0 and 60.
   */
  pitch?: number | undefined
  /**
   * Overlays to be applied to the static map.
   */
  overlays?: Array<CustomMarker | SimpleMarker | Path> | undefined
  /**
   * Determines if there is attribution on the map. Note that this does not remove the requirement to attribute maps that use OpenStreetMap data.
   */
  attribution?: boolean | undefined
  /**
   * Determines if there is a Mapbox logo on the map.
   */
  logo?: boolean | undefined
  /**
   * @2x renders the map at 2x scale.
   */
  highDPI?: boolean | undefined
}

interface CustomMarker {
  /**
   * Marker type
   */
  marker: {
    /**
     * Longitude for the marker; a number between -180 and 180.
     */
    coordinates: Coordinates
    /**
     * Marker image URL. The URL must be accessible via HTTPS.
     */
    url: string
  }
}

interface SimpleMarker {
  /**
   * Marker type
   */
  marker: {
    /**
     * Longitude for the marker; a number between -180 and 180.
     */
    coordinates: Coordinates
    /**
     * Marker size. Options are s, m, or l.
     */
    size?: "s" | "m" | "l" | undefined
    /**
     * Marker symbol. Options are an alphanumeric label a-z, 0-99, or a valid Maki icon.
     */
    label?: string | undefined
    /**
     * Marker color. Options are a 3- or 6-digit hexadecimal color code.
     */
    color?: string | undefined
  }
}

interface Path {
  /**
   * Path type
   */
  path: {
    /**
     * Path stroke width between 1 and 20.
     */
    strokeWidth?: number | undefined
    /**
     * Path stroke color as a 3- or 6-digit hexadecimal color code.
     */
    strokeColor?: string | undefined
    /**
     * Path stroke opacity between 0 and 1.
     */
    strokeOpacity?: number | undefined
    /**
     * Path fill color as a 3- or 6-digit hexadecimal color code.
     */
    fillColor?: string | undefined
    /**
     * Path fill opacity between 0 and 1.
     */
    fillOpacity?: number | undefined
    /**
     * Path coordinates as an encoded polyline or GeoJSON.
     */
    coordinates: string | GeoJSON.LineString | GeoJSON.Polygon
  }
}