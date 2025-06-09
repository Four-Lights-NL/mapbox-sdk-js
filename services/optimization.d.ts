/// <reference types="node" />

import type { Coordinates, MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Optimization(config: SdkConfig | MapiClient): OptimizationService

interface OptimizationService {
  getOptimization(request: OptimizationRequest): MapiRequest<OptimizationResponse>
}

interface OptimizationRequest {
  /**
   * An array of coordinate pairs in [longitude,latitude] format. There must be between 2 and 12 coordinates.
   * The first coordinate is the start point for the trip. The last coordinate will be the end point for the trip.
   */
  coordinates: Coordinates[]
  /**
   * A routing profile. Options are mapbox/driving (default), mapbox/walking, or mapbox/cycling.
   */
  profile?: "driving" | "walking" | "cycling" | undefined
  /**
   * Return additional metadata along the route.
   */
  annotations?: OptimizationAnnotation[] | undefined
  /**
   * Specify pick-up and drop-off locations for a trip by providing a ; delimited list of number pairs that correspond with the coordinates list.
   */
  distributions?: Distribution[] | undefined
  /**
   * Format of the returned geometry. Allowed values are geojson (as LineString), polyline with precision 5, polyline6. The default value is polyline.
   */
  geometries?: "geojson" | "polyline" | "polyline6" | undefined
  /**
   * Language of returned turn-by-turn text instructions.
   */
  language?: string | undefined
  /**
   * Type of returned overview geometry. Can be full, simplified, or false. The default is simplified.
   */
  overview?: "full" | "simplified" | "false" | undefined
  /**
   * Emit instructions at roundabout exits. Can be true or false. The default is false.
   */
  roundtrip?: boolean | undefined
  /**
   * Indicates from which side of the road to approach a waypoint.
   */
  source?: "first" | "any" | undefined
  /**
   * Indicates from which side of the road to approach a waypoint.
   */
  destination?: "last" | "any" | undefined
  /**
   * Whether to return steps and turn-by-turn instructions. Can be true or false. The default is false.
   */
  steps?: boolean | undefined
}

interface OptimizationResponse {
  /**
   * A string depicting the state of the response.
   */
  code: string
  /**
   * An array of waypoint objects. Each waypoints is an input coordinate snapped to the road and path network.
   */
  waypoints: OptimizationWaypoint[]
  /**
   * An array of route objects.
   */
  trips: OptimizationTrip[]
}

interface OptimizationWaypoint {
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
  /**
   * Index of the trip the waypoint belongs to.
   */
  trips_index: number
  /**
   * Index of the waypoint in the trip.
   */
  waypoint_index: number
}

interface OptimizationTrip {
  /**
   * The distance traveled, in meters.
   */
  distance: number
  /**
   * The estimated travel time, in seconds.
   */
  duration: number
  /**
   * The calculated weight of the route.
   */
  weight: number
  /**
   * The name of the weight profile used during extraction phase.
   */
  weight_name: string
  /**
   * Depending on the geometries parameter, this is a GeoJSON LineString or a Polyline string.
   */
  geometry: string
  /**
   * An array of route leg objects.
   */
  legs: OptimizationLeg[]
}

interface OptimizationLeg {
  /**
   * The distance traveled, in meters.
   */
  distance: number
  /**
   * The estimated travel time, in seconds.
   */
  duration: number
  /**
   * The calculated weight of the route.
   */
  weight: number
  /**
   * A summary of the route taken for this leg.
   */
  summary: string
  /**
   * Depending on the steps parameter, either an array of route step objects or an empty array.
   */
  steps: any[]
  /**
   * Additional details about each coordinate along the route geometry.
   */
  annotation?: any
}

interface Distribution {
  /**
   * Index to the coordinate in the coordinates array.
   */
  pickup: number
  /**
   * Index to the coordinate in the coordinates array.
   */
  dropoff: number
}

type OptimizationAnnotation = "duration" | "speed" | "distance"