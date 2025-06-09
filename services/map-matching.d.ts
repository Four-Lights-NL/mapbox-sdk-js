/// <reference types="node" />

import type {
  DirectionsAnnotation,
  DirectionsGeometry,
  DirectionsOverview,
  Leg,
} from "@mapbox/mapbox-sdk/services/directions"
import type {
  Coordinates,
  DirectionsApproach,
  MapboxProfile,
  MapiRequest,
} from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient, { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

/*********************************************************************************************************************
 * Map Matching Types
 *********************************************************************************************************************/
export default function MapMatching(config: SdkConfig | MapiClient): MapMatchingService

interface MapMatchingService {
  getMatch(request: MapMatchingRequest): MapiRequest<MapMatchingResponse>
}

interface MapMatchingRequest {
  /**
   * An ordered array of MapMatchingPoints, between 2 and 100 (inclusive), or an OpenLR encoded string.
   */
  points: MapMatchingPoint[] | string
  /**
   * A directions profile ID. (optional, default driving)
   */
  profile?: MapboxProfile | undefined
  /**
   * Specify additional metadata that should be returned.
   */
  annotations?: DirectionsAnnotation[] | undefined
  /**
   * Format of the returned geometry. (optional, default "polyline")
   */
  geometries?: DirectionsGeometry | undefined
  /**
   * Language of returned turn-by-turn text instructions. See supported languages. (optional, default "en")
   */
  language?: string | undefined
  /**
   * Type of returned overview geometry. (optional, default "simplified"
   */
  overview?: DirectionsOverview | undefined
  /**
   * Whether to return steps and turn-by-turn instructions. (optional, default false)
   */
  steps?: boolean | undefined
  /**
   * Whether or not to transparently remove clusters and re-sample traces for improved map matching results. (optional, default false)
   */
  tidy?: boolean | undefined
  /**
   * Whether to return base64-encoded OpenLR location references. (optional, default false)
   */
  linear_references?: boolean | undefined
  /**
   * OpenLR specification version. Required when using OpenLR encoded strings.
   */
  openLR_spec?: "tomtom" | "here" | undefined
  /**
   * OpenLR format. Required when using OpenLR encoded strings.
   */
  openLR_format?: "xml" | "binary" | undefined
  /**
   * Whether to return banner objects associated with the route steps. (optional, default false)
   */
  banner_instructions?: boolean | undefined;
  /**
   * Whether to emit instructions at roundabout exits. (optional, default false)
   */
  roundabout_exits?: boolean | undefined;
  /**
   * Whether to return SSML marked-up text for voice guidance along the route. (optional, default false)
   */
  voice_instructions?: boolean | undefined;
  /**
   * Specify which type of units to return in the text for voice instructions. (optional, default "imperial")
   */
  voice_units?: "imperial" | "british_imperial" | "metric" | undefined;
  /**
   * A semicolon-separated list of custom names for waypoints.
   */
  waypoint_names?: string | undefined;
  /**
   * A semicolon-separated list indicating which input coordinates should be treated as waypoints.
   */
  waypoints?: string | undefined;
  /**
   * Ignore certain routing restrictions when map matching.
   */
  ignore?: ("access" | "oneways" | "restrictions")[] | undefined;
  /**
   * The departure time from the first coordinates, formatted in ISO 8601.
   */
  depart_at?: string | undefined;
}

interface Point {
  coordinates: Coordinates
  /**
   * Used to indicate how requested routes consider from which side of the road to approach a waypoint.
   */
  approach?: DirectionsApproach | undefined
}

interface MapMatchingPoint extends Point {
  /**
   * A number in meters indicating the assumed precision of the used tracking device.
   */
  radius?: number | undefined
  /**
   * Whether this coordinate is waypoint or not. The first and last coordinates will always be waypoints.
   */
  isWaypoint?: boolean | undefined
  /**
   * Custom name for the waypoint used for the arrival instruction in banners and voice instructions.
   * Will be ignored unless isWaypoint is true.
   */
  waypointName?: string | undefined
  /**
   * Datetime corresponding to the coordinate.
   */
  timestamp?: string | number | Date | undefined
}

interface MapMatchingResponse {
  /**
   * An array of Match objects.
   */
  matchings: Matching[]
  /**
   * An array of Tracepoint objects representing the location an input point was matched with.
   * Array of Waypoint objects representing all input points of the trace in the order they were matched.
   * If a trace point is omitted by map matching because it is an outlier, the entry will be null.
   */
  tracepoints: (Tracepoint | null)[]
  /**
   * A string depicting the state of the response; see below for options
   */
  code: string
}

interface Tracepoint {
  /**
   * The index of the match object in matchings that the sub-trace was matched to.
   */
  matchings_index: number
  /**
   * The index of the waypoint inside the matched route.
   */
  waypoint_index: number
  /**
   * The number of probable alternative matchings for this trace point. A value of 0 indicates that this point was matched unambiguously.
   * Split the trace at these points for incremental map matching.
   */
  alternatives_count: number
  /**
   * The name of the road or path the coordinate snapped to.
   */
  name: string
  /**
   * An array that contains the location of the snapped coordinate, in the format [longitude, latitude].
   */
  location: number[]
  /**
   * The maximum speed limit at the tracepoint.
   */
  maxspeed?: MaxspeedObject | undefined;
}

interface Matching {
  /**
   * The level of confidence in the returned match, from 0 (low) to 1 (high).
   */
  confidence: number
  /**
   * The distance traveled, in meters.
   */
  distance: number
  /**
   * The estimated travel time, in seconds.
   */
  duration: number
  /**
   * The weight in units described by weight_name.
   */
  weight: number
  /**
   * The weight used. The default is routability, which is duration-based, with additional penalties for less desirable maneuvers.
   */
  weight_name: string
  /**
   * Depending on the geometries parameter in the request, this is a GeoJSON LineString or a Polyline string.
   * Depending on the overview parameter in the request, this is the complete route geometry (full),
   * a simplified geometry to the zoom level at which the route can be displayed in full (simplified), or is not included (false).
   */
  geometry: string
  /**
   * An array of route leg objects.
   */
  legs: RouteLeg[]
  /**
   * The locale used for voice instructions. Defaults to en (English). See supported languages.
   * Requires steps=true.
   */
  voice_locale?: string | undefined
  /**
   * An array of base64-encoded OpenLR location references, one for each graph edge of the road network matched by the input trace.
   * This key is optional, and present only when linear_references=true in the request.
   */
  linear_references?: string[] | undefined
}

interface RouteLeg extends Leg {
  /**
   * Additional metadata along the route leg.
   */
  annotation?: AnnotationObject | undefined;
}

interface AnnotationObject {
  /**
   * The distance between each pair of coordinates, in meters.
   */
  distance?: number[] | undefined;
  /**
   * The duration between each pair of coordinates, in seconds.
   */
  duration?: number[] | undefined;
  /**
   * The speed between each pair of coordinates, in meters per second.
   */
  speed?: number[] | undefined;
  /**
   * The level of congestion between each entry in the array of coordinate pairs in the route leg.
   */
  congestion?: string[] | undefined;
  /**
   * The numeric level of congestion between each entry in the array of coordinate pairs in the route leg.
   */
  congestion_numeric?: number[] | undefined;
  /**
   * The maximum speed limit between the coordinates of a segment.
   */
  maxspeed?: MaxspeedObject[] | undefined;
}

interface MaxspeedObject {
  /**
   * The speed value.
   */
  speed?: number | undefined;
  /**
   * The unit of speed (e.g., 'km/h').
   */
  unit?: string | undefined;
  /**
   * Indicates if the speed limit is unknown.
   */
  unknown?: boolean | undefined;
}