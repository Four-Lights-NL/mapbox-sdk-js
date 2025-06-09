/// <reference types="node" />

import type { Coordinates, MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Matrix(config: SdkConfig | MapiClient): MatrixService

interface MatrixService {
  getMatrix(request: MatrixRequest): MapiRequest<MatrixResponse>
}

interface MatrixRequest {
  /**
   * An array of coordinate pairs in [longitude,latitude] format. There must be between 2 and 25 coordinates.
   */
  coordinates: Coordinates[]
  /**
   * A routing profile. Options are mapbox/driving (default), mapbox/walking, mapbox/cycling, or mapbox/driving-traffic.
   */
  profile?: "driving" | "walking" | "cycling" | "driving-traffic" | undefined
  /**
   * Use the coordinates at given index as sources for the matrix. If not provided, all coordinates are used as sources.
   */
  sources?: number[] | undefined
  /**
   * Use the coordinates at given index as destinations for the matrix. If not provided, all coordinates are used as destinations.
   */
  destinations?: number[] | undefined
  /**
   * Return the requested table or tables in response to the query. Options are duration (default), distance, or both.
   */
  annotations?: Array<"duration" | "distance"> | undefined
  /**
   * Specify which input coordinates should be treated as waypoints.
   */
  approaches?: Array<"unrestricted" | "curb"> | undefined
  /**
   * Departure date and time to use for the matrix. When provided, the response will include a duration_typical field that shows typical travel times for the specified time.
   */
  depart_at?: string | undefined
}

interface MatrixResponse {
  /**
   * An array of arrays that in combination forms a matrix.
   */
  durations?: number[][] | undefined
  /**
   * An array of arrays that in combination forms a matrix.
   */
  distances?: number[][] | undefined
  /**
   * An array of Destination objects.
   */
  destinations: Destination[]
  /**
   * An array of Destination objects.
   */
  sources: Destination[]
  /**
   * A string depicting the state of the response.
   */
  code: string
}

interface Destination {
  /**
   * The snapped coordinate.
   */
  location: Coordinates
  /**
   * The name of the road or path the coordinate snapped to.
   */
  name: string
  /**
   * The straight line distance from the coordinate specified in the query to the location it was snapped to.
   */
  distance?: number | undefined
}