/// <reference types="node" />

import type * as GeoJSON from "geojson"
import type MapiClient, { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { Coordinates, DirectionsApproach, MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"

export default function Directions(config: SdkConfig | MapiClient): DirectionsService

interface DirectionsService {
  getDirections(
    request: DirectionsRequest | DirectionsRequest<"polyline" | "polyline6">,
  ): MapiRequest<DirectionsResponse>
  getDirections(
    request: DirectionsRequest<"geojson">,
  ): MapiRequest<DirectionsResponse<GeoJSON.MultiLineString | GeoJSON.LineString>>
}

type DirectionsAnnotation =
  | "duration"
  | "distance"
  | "speed"
  | "congestion"
  | "congestion_numeric"
  | "maxspeed"
  | "closure"
  | "state_of_charge"
type DirectionsGeometry = "geojson" | "polyline" | "polyline6"
type DirectionsOverview = "full" | "simplified" | "false"
type DirectionsUnits = "imperial" | "metric"
type DirectionsSide = "left" | "right"
type DirectionsMode = "driving" | "ferry" | "unaccessible" | "walking" | "cycling" | "train"
type DirectionsClass = "toll" | "ferry" | "restricted" | "motorway" | "tunnel"
type ManeuverModifier =
  | "uturn"
  | "sharp right"
  | "right"
  | "slight right"
  | "straight"
  | "slight left"
  | "left"
  | "sharp left"
  | "depart"
  | "arrive"
type ManeuverType =
  | "turn"
  | "new name"
  | "depart"
  | "arrive"
  | "merge"
  | "on ramp"
  | "off ramp"
  | "fork"
  | "end of road"
  | "continue"
  | "roundabout"
  | "rotary"
  | "roundabout turn"
  | "notification"
  | "exit roundabout"
  | "exit rotary"
type Polyline = string
type RouteGeometry = GeoJSON.LineString | GeoJSON.MultiLineString | Polyline

interface CommonDirectionsRequest<T extends DirectionsGeometry = "polyline"> {
  waypoints: DirectionsWaypoint[]
  /**
   * Whether to try to return alternative routes. An alternative is classified as a route that is significantly
   * different than the fastest route, but also still reasonably fast. Such a route does not exist in all circumstances.
   * Currently up to two alternatives can be returned. Can be  true or  false (default).
   */
  alternatives?: boolean | undefined
  /**
   * Whether or not to return additional metadata along the route. Possible values are:  duration ,  distance ,  speed , and congestion .
   * Several annotations can be used by including them as a comma-separated list. See the RouteLeg object for more details on
   * what is included with annotations.
   */
  annotations?: DirectionsAnnotation[] | undefined

  /**
   * Whether or not to return banner objects associated with the  routeSteps .
   * Should be used in conjunction with  steps . Can be  true or  false . The default is  false .
   */
  bannerInstructions?: boolean | undefined

  /**
   * Sets the allowed direction of travel when departing intermediate waypoints. If  true , the route will continue in the same
   * direction of travel. If  false , the route may continue in the opposite direction of travel. Defaults to  true for mapbox/driving and
   * false for  mapbox/walking and  mapbox/cycling .
   */
  continueStraight?: boolean | undefined
  /**
   * Format of the returned geometry. Allowed values are:  geojson (as LineString ),
   * polyline with precision 5,  polyline6 (a polyline with precision 6). The default value is  polyline .
   */
  geometries?: T
  /**
   * Language of returned turn-by-turn text instructions. See supported languages . The default is  en for English.
   */
  language?: string | undefined
  /**
   * Type of returned overview geometry. Can be  full (the most detailed geometry available),
   * simplified (a simplified version of the full geometry), or  false (no overview geometry). The default is  simplified .
   */
  overview?: DirectionsOverview | undefined

  /**
   * Emit instructions at roundabout exits. Can be  true or  false . The default is  false .
   */
  roundaboutExits?: boolean | undefined
  /**
   * Whether to return steps and turn-by-turn instructions. Can be  true or  false . The default is  false .
   */
  steps?: boolean | undefined
  /**
   * Whether or not to return SSML marked-up text for voice guidance along the route. Should be used in conjunction with steps .
   * Can be  true or  false . The default is  false .
   */
  voiceInstructions?: boolean | undefined
  /**
   * Which type of units to return in the text for voice instructions. Can be  imperial or  metric . Default is  imperial .
   */
  voiceUnits?: DirectionsUnits | undefined
}

type DirectionsProfileInclusion =
  | {
      profile: "walking" | "cycling"
    }
  | {
      profile: "driving"
      /**
       * The desired arrival time, formatted as a timestamp in ISO-8601 format in the local time at the route destination. The travel time, returned in duration, is a prediction for travel time based on historical travel data. The route is calculated in a time-dependent manner. For example, a trip that takes two hours will consider changing historic traffic conditions across the two-hour window. The route takes timed turn restrictions and conditional access restrictions into account based on the requested arrival time.
       */
      arriveBy?: string
      /**
       * The departure time, formatted as a timestamp in ISO-8601 format in the local time at the route origin. The travel time, returned in duration, is a prediction for travel time based on historical travel data. The route is calculated in a time-dependent manner. For example, a trip that takes two hours will consider changing historic traffic conditions across the two-hour window, instead of only at the specified depart_at time. The route takes timed turn restrictions and conditional access restrictions into account based on the requested departure time.
       */
      departAt?: string
      /**
       * Set to electric to enable electric vehicle routing.
       */
      engine?: "electric_no_recharge" | "electric"
      /**
       * Optional parameter to specify initial charge of vehicle in Wh (watt-hours) at the beginning of the route.
       */
      ev_initial_charge?: number
      /**
       * Required parameter that defines the maximum possible charge of vehicle in Wh (watt-hours).
       */
      ev_max_charge?: number
      /**
       * Required parameter that defines the compatible connector-types for the vehicle.
       */
      ev_connector_types?: "ccs_combo_type1" | "ccs_combo_type2" | "tesla"
      /**
       * Required parameter that specifies in pairs the energy consumption in watt-hours per kilometer at a certain speed in kph.
       */
      energy_consumption_curve?: string
      /**
       * Required parameter that specifies the maximum battery charging rate (W) at a given charge level (Wh) in a list of pairs.
       */
      ev_charging_curve?: string
      /**
       * Optional parameter that specifies the maximum battery charging rate (W) at a given charge level (Wh) in a list of pairs when the battery is in an unconditioned state (eg: cold).
       */
      ev_unconditioned_charging_curve?: string
      /**
       * Optional parameter that defines the time in minutes it would take for the vehicle's battery to condition.
       */
      ev_pre_conditioning_time?: number
      /**
       * Optional parameter to specify maximum AC charging power(W) that can be delivered by the onboard vehicle charger.
       */
      ev_max_ac_charging_power?: number
      /**
       * Optional parameter to define the minimum battery charge required at the final route destination (Wh).
       */
      ev_min_charge_at_destination?: number
      /**
       * Optional parameter to define the minimum charge when arriving at the charging station (Wh).
       */
      ev_min_charge_at_charging_station?: number
      /**
       * Optional parameter to define the measure of the continuous power draw of the auxiliary systems in watts (E.G heating or AC).
       */
      auxiliary_consumption?: number
      /**
       * The max vehicle height, in meters. If this parameter is provided, the Directions API will compute a route that includes only roads with a height limit greater than or equal to the max vehicle height. max_height must be between 0 and 10 meters. The default value is 1.6 meters. Coverage for road height restriction may vary by region.
       */
      maxHeight?: number
      /**
       * The max vehicle weight, in metric tons (1000 kg). If this parameter is provided, the Directions API will compute a route that includes only roads with a weight limit greater than or equal to the max vehicle weight. max_weight must be between 0 and 100 metric tons. The default value is 2.5 metric tons. Coverage for road weight restriction may vary by region.
       */
      maxWeight?: number
      /**
       * The max vehicle width, in meters. If this parameter is provided, the Directions API will compute a route that includes only roads with a width limit greater than or equal to the max vehicle width. max_width must be between 0 and 10 meters. The default value is 1.9 meters. Coverage for road width restriction may vary by region.
       */
      maxWidth?: number
      /**
       * Returns notification metadata associated with the route leg of the route object.
       */
      notifications?: string
    }
  | {
      profile: "driving-traffic"
      /**
       * The departure time, formatted as a timestamp in ISO-8601 format in the local time at the route origin. The travel time, returned in duration, is a prediction for travel time based on historical travel data and live traffic. Live traffic is gently mixed with historical data when depart_at is set close to current time. The route takes timed turn restrictions and conditional access restrictions into account based on the requested arrival time.
       */
      departAt?: string
      /**
       * Set to electric to enable electric vehicle routing.
       */
      engine?: "electric_no_recharge" | "electric"
      /**
       * Optional parameter to specify initial charge of vehicle in Wh (watt-hours) at the beginning of the route.
       */
      ev_initial_charge?: number
      /**
       * Required parameter that defines the maximum possible charge of vehicle in Wh (watt-hours).
       */
      ev_max_charge?: number
      /**
       * Required parameter that defines the compatible connector-types for the vehicle.
       */
      ev_connector_types?: "ccs_combo_type1" | "ccs_combo_type2" | "tesla"
      /**
       * Required parameter that specifies in pairs the energy consumption in watt-hours per kilometer at a certain speed in kph.
       */
      energy_consumption_curve?: string
      /**
       * Required parameter that specifies the maximum battery charging rate (W) at a given charge level (Wh) in a list of pairs.
       */
      ev_charging_curve?: string
      /**
       * Optional parameter that specifies the maximum battery charging rate (W) at a given charge level (Wh) in a list of pairs when the battery is in an unconditioned state (eg: cold).
       */
      ev_unconditioned_charging_curve?: string
      /**
       * Optional parameter that defines the time in minutes it would take for the vehicle's battery to condition.
       */
      ev_pre_conditioning_time?: number
      /**
       * Optional parameter to specify maximum AC charging power(W) that can be delivered by the onboard vehicle charger.
       */
      ev_max_ac_charging_power?: number
      /**
       * Optional parameter to define the minimum battery charge required at the final route destination (Wh).
       */
      ev_min_charge_at_destination?: number
      /**
       * Optional parameter to define the minimum charge when arriving at the charging station (Wh).
       */
      ev_min_charge_at_charging_station?: number
      /**
       * Optional parameter to define the measure of the continuous power draw of the auxiliary systems in watts (E.G heating or AC).
       */
      auxiliary_consumption?: number
      /**
       * The max vehicle height, in meters. If this parameter is provided, the Directions API will compute a route that includes only roads with a height limit greater than or equal to the max vehicle height. max_height must be between 0 and 10 meters. The default value is 1.6 meters. Coverage for road height restriction may vary by region.
       */
      maxHeight?: number
      /**
       * The max vehicle weight, in metric tons (1000 kg). If this parameter is provided, the Directions API will compute a route that includes only roads with a weight limit greater than or equal to the max vehicle weight. max_weight must be between 0 and 100 metric tons. The default value is 2.5 metric tons. Coverage for road weight restriction may vary by region.
       */
      maxWeight?: number
      /**
       * The max vehicle width, in meters. If this parameter is provided, the Directions API will compute a route that includes only roads with a width limit greater than or equal to the max vehicle width. max_width must be between 0 and 10 meters. The default value is 1.9 meters. Coverage for road width restriction may vary by region.
       */
      maxWidth?: number
      /**
       * Returns notification metadata associated with the route leg of the route object.
       */
      notifications?: string
    }

type DirectionsProfileExclusion =
  | {
      profile: "walking"
      exclude?: [] | undefined
    }
  | {
      profile: "cycling"
      exclude?: Array<"ferry"> | undefined
    }
  | {
      profile: "driving" | "driving-traffic"
      exclude?: Array<"ferry" | "toll" | "motorway"> | undefined
    }

type DirectionsRequest<T extends DirectionsGeometry = "polyline"> = CommonDirectionsRequest<T> &
  DirectionsProfileInclusion &
  DirectionsProfileExclusion

interface Waypoint {
  /**
   * The name of the road or path to which the input coordinate has been snapped.
   */
  name: string
  /**
   * The snapped coordinate as [longitude, latitude].
   */
  location: Coordinates
  /**
   * An object describing time zone relevant information. This is only available for driving-traffic, driving and walking profiles.
   * If using walking or driving profile, then depart_at or arrive_by must be used to receive time zone data.
   */
  time_zone?: TimeZone | undefined
  /**
   * Optional. The straight-line distance from the coordinate specified in the query to the location it was snapped to.
   */
  distance?: number | undefined
  /**
   * Optional. An object describing charging stops inserted by EV Routing for routes requiring charging along the way.
   * Its set to null for user provided waypoints including start & end locations.
   */
  metadata?: ChargingWaypointMetadata | null | undefined
}

interface TimeZone {
  /**
   * A unique string that specifies a time zone in the format of Region/Location, for example America/New_York or Europe/Paris,
   * as defined by the IANA Time Zone Database.
   */
  identifier: string
  /**
   * The difference in hours and minutes between a specific time zone and Coordinated Universal Time (UTC),
   * for example -05:00 for Eastern Standard Time or +01:00 for Central European Time.
   */
  offset: string
  /**
   * Optional. A short, commonly recognized abbreviation for a time zone, often used for display purposes,
   * for example EST for Eastern Standard Time or CET for Central European Time. Note that this field may not always be available.
   */
  abbreviation?: string | undefined
}

interface ChargingWaypointMetadata {
  /**
   * The type of charging station.
   */
  type: "charging-station"
  /**
   * The name of the charging station.
   */
  name: string
  /**
   * The time required to charge at this station, in seconds.
   */
  charge_time: number
  /**
   * The battery charge level after charging at this station, in watt-hours.
   */
  charge_to: number
  /**
   * The battery charge level upon arrival at this station, in watt-hours.
   */
  charge_at_arrival: number
  /**
   * The type of charging plug/connector.
   */
  plug_type: string
  /**
   * The charging power in kilowatts.
   */
  power_kw: number
  /**
   * The unique identifier for the charging station.
   */
  station_id: string
  /**
   * An array of provider names for the charging station.
   */
  provider_names: string[]
}

interface DirectionsWaypointInput {
  /**
   * Semicolon-separated list of  {longitude},{latitude} coordinate pairs to visit in order. There can be between 2 and 25 coordinates.
   */
  coordinates: Coordinates
  /**
   * Used to filter the road segment the waypoint will be placed on by direction and dicates the anlge of approach.
   * This option should always be used in conjunction with a `radius`. The first values is angle clockwise from true
   * north between 0 and 360, and the second is the range of degrees the angle can deviate by.
   */
  bearing?: Coordinates | undefined
  /**
   * Used to indicate how requested routes consider from which side of the road to approach a waypoint.
   * Accepts unrestricted (default) or  curb . If set to  unrestricted , the routes can approach waypoints from either side of the road.
   * If set to  curb , the route will be returned so that on arrival, the waypoint will be found on the side that corresponds with the
   * driving_side of the region in which the returned route is located. Note that the  approaches parameter influences how you arrive at a waypoint,
   * while  bearings influences how you start from a waypoint. If provided, the list of approaches must be the same length as the list of waypoints.
   * However, you can skip a coordinate and show its position in the list with the  ; separator.
   */
  approach?: DirectionsApproach | undefined
  /**
   * Maximum distance in meters that each coordinate is allowed to move when snapped to a nearby road segment.
   * There must be as many radiuses as there are coordinates in the request, each separated by ';'.
   * Values can be any number greater than 0 or the string 'unlimited'.
   * A  NoSegment error is returned if no routable road is found within the radius.
   */
  radius?: number | "unlimited" | undefined
}

type DirectionsWaypoint = DirectionsWaypointInput & {
  /**
   * Custom name for the waypoint used for the arrival instruction in banners and voice instructions.
   */
  waypointName?: string | undefined
}

interface DirectionsResponse<T extends RouteGeometry = Polyline> {
  /**
   * Array of Route objects ordered by descending recommendation rank. May contain at most two routes.
   */
  routes: Array<Route<T>>
  /**
   * Array of Waypoint objects. Each waypoints is an input coordinate snapped to the road and path network.
   * The waypoints appear in the array in the order of the input coordinates.
   */
  waypoints: DirectionsWaypoint[]
  /**
   * String indicating the state of the response. This is a separate code than the HTTP status code.
   * On normal valid responses, the value will be Ok.
   */
  code: string
  uuid: string
}

interface Route<T extends RouteGeometry> {
  /**
   * The estimated travel time through the waypoints, in seconds.
   */
  duration: number
  /**
   * The distance traveled through the waypoints, in meters.
   */
  distance: number
  /**
   * Specifies the weight used, which by default is duration-based and includes additional penalties for less desirable maneuvers.
   * For mapbox/driving & mapbox/driving-traffic its set to auto, while for mapbox/walking its set to pedestrian.
   */
  weight_name: string
  /**
   * A numeric value representing desirability of a route, where a lower weight indicates a more favorable route when comparing two routes with the same set of waypoints.
   * In case multiple routes are returned, they are sorted in ascending order based on their weights.
   */
  weight: number
  /**
   * When using the driving-traffic profile, this will be returned as a float indicating the duration of the route under typical conditions (not taking into account live traffic).
   */
  duration_typical?: number | undefined
  /**
   * When using the driving-traffic profile, this will be returned as a float indicating the weight of the selected route under typical conditions (not taking into account live traffic).
   */
  weight_typical?: number | undefined
  /**
   * Depending on the geometries query parameter, this is either a GeoJSON LineString or a Polyline string.
   * Depending on the overview query parameter, this is the complete route geometry (full), a simplified geometry to the zoom level at which the route can be displayed in full (simplified), or is not included (false).
   */
  geometry: T
  /**
   * An array of route leg objects.
   */
  legs: Leg[]
  /**
   * The locale used for voice instructions. Defaults to en (English). Can be any accepted instruction language.
   * voiceLocale is only present in the response when voice_instructions=true.
   */
  voiceLocale?: string | undefined
  /**
   * When the input parameter waypoints_per_route=true is used, the waypoints will appear in the route object and display an array of waypoint objects specific to that route.
   * Each waypoint is an input coordinate snapped to the road and path network. The waypoints appear in the order traversed by the route.
   * These waypoints can now contain additional waypoints like charging-stations, if used in EV-routing.
   */
  waypoints?: Waypoint[] | undefined
}

interface Leg {
  /**
   * The distance traveled between waypoints, in meters.
   */
  distance: number
  /**
   * The estimated travel time between waypoints, in seconds.
   */
  duration: number
  /**
   * The weight in units described by weight_name.
   */
  weight: number
  /**
   * When using the driving-traffic profile, this will be returned as sign of duration of the leg under typical conditions (not taking into account live traffic).
   */
  duration_typical?: number | undefined
  /**
   * When using the driving-traffic profile, this will be returned as sign of the weight of the leg under typical conditions (not taking into account live traffic).
   */
  weight_typical?: number | undefined
  /**
   * Depending on the optional steps parameter, either an array of route step objects (steps=true) or an empty array (steps=false, default).
   */
  steps: Step[]
  /**
   * A summary of major roads traversed in this leg of the route.
   */
  summary: string
  /**
   * An array of objects describing the administrative boundaries the route leg travels through.
   * Use admin_index on the intersection object to look up the administrative boundaries for each intersection in this array.
   */
  admins?: Admin[] | undefined
  /**
   * An array of incident objects describing temporary events that occur along the roadway.
   * This is only provided if incidents exist and you are using the mapbox/driving-traffic profile.
   */
  incidents?: Incident[] | undefined
  /**
   * Included in the route leg object when making a mapbox/driving-traffic request with annotations=closure,... and there are live-traffic closures along the route.
   * This is an array of closure objects.
   */
  closures?: Closure[] | undefined
  /**
   * An annotations object that contains additional details about each line segment along the route geometry.
   * Each entry in an annotations field corresponds to a coordinate along the route geometry.
   */
  annotation?: LegAnnotation | undefined
  /**
   * When the semicolon-separated list waypoints parameter is used in the request, an array per leg is returned that describes where a particular waypoint from the root-level array matches to the route.
   */
  via_waypoints?: ViaWaypoint[] | undefined
  /**
   * An optional array of notification objects describing notifications about the route.
   */
  notifications?: Notification[] | undefined
}

interface Admin {
  /**
   * Contains the two-letter ISO 3166-1 alpha-2 code that applies to a country boundary. Example: "US".
   */
  iso_3166_1: string
  /**
   * Contains the three-letter ISO 3166-1 alpha-3 code that applies to a country boundary. Example: "USA".
   */
  iso_3166_1_alpha3: string
}

interface Incident {
  /**
   * The unique ID of the incident.
   */
  id: string
  /**
   * The type of incident this is.
   */
  type: "accident" | "congestion" | "construction" | "disabled_vehicle" | "lane_restriction" | "mass_transit" | "miscellaneous" | "other_news" | "planned_event" | "road_closure" | "road_hazard" | "weather"
  /**
   * A short description of the incident in a human-readable format.
   */
  description: string
  /**
   * A long description of the incident in a human-readable format.
   */
  long_description: string
  /**
   * The time this incident was last created as an incident on the map in ISO-8601 format.
   */
  creation_time: string
  /**
   * The time this incident was started or is expected to start in ISO-8601 format.
   */
  start_time: string
  /**
   * The time this incident ended or is expected to end in ISO-8601 format.
   */
  end_time: string
  /**
   * The impact of the incident on local traffic.
   */
  impact: "unknown" | "critical" | "major" | "minor" | "low"
  /**
   * Lanes that are blocked by the incident.
   */
  lanes_blocked: string[]
  /**
   * The number of items in the lanes_blocked array.
   */
  num_lanes_blocked: number
  /**
   * Contains information about the amount of congestion on the road around the incident.
   */
  congestion: {
    /**
     * A number between 0 and 101 representing the level of congestion caused by the incident.
     */
    value: number
  }
  /**
   * If this is true then the road has been completely closed.
   */
  closed: boolean
  /**
   * The position in the coordinate list where the incident began, relative to the start of the leg it's on.
   */
  geometry_index_start: number
  /**
   * The position in the coordinate list where the incident ended, relative to the start of the leg it's on.
   */
  geometry_index_end: number
  /**
   * This could contain additional information about the type of incident.
   */
  sub_type?: string | undefined
  /**
   * This could contain detail about the value of the sub_type field.
   */
  sub_type_description?: string | undefined
  /**
   * The two-letter ISO 3166-1 alpha-2 code for the country the incident is located in.
   */
  iso_3166_1_alpha2: string
  /**
   * The three-letter ISO 3166-1 alpha-3 code for the country the incident is located in.
   */
  iso_3166_1_alpha3: string
  /**
   * List of roads names affected by the incident.
   */
  affected_road_names: string[]
  /**
   * The incident bounding box south latitude coordinate as float.
   */
  south: number
  /**
   * The incident bounding box west longitude coordinate as float.
   */
  west: number
  /**
   * The incident bounding box north latitude coordinate as float.
   */
  north: number
  /**
   * The incident bounding box east longitude coordinate as float.
   */
  east: number
}

interface Closure {
  // Define closure properties based on API documentation
  [key: string]: any
}

interface LegAnnotation {
  /**
   * The level of congestion, described as severe, heavy, moderate, low or unknown, between each entry in the array of coordinate pairs in the route leg.
   */
  congestion?: string[] | undefined
  /**
   * The level of congestion in numeric form, from 0-100. A value of 0 indicates no congestion, a value of 100 indicates maximum congestion.
   */
  congestion_numeric?: (number | null)[] | undefined
  /**
   * The distance between each pair of coordinates, in meters.
   */
  distance?: number[] | undefined
  /**
   * The duration between each pair of coordinates, in seconds.
   */
  duration?: number[] | undefined
  /**
   * The local posted speed limit between each pair of coordinates.
   */
  maxspeed?: object[] | undefined
  /**
   * The battery's current state of charge as a percentage of the maximum capacity.
   */
  state_of_charge?: number[] | undefined
  /**
   * The average speed used in the calculation between the two points in each pair of coordinates, in meters per second.
   */
  speed?: number[] | undefined
}

interface ViaWaypoint {
  /**
   * The associated waypoint index, excluding the origin (index 0) and destination.
   */
  waypoint_index: number
  /**
   * The calculated distance, in meters, from the leg origin.
   */
  distance_from_start: number
  /**
   * The associated leg shape index of the via waypoint location.
   */
  geometry_index: number
}

interface Notification {
  /**
   * The type of notifications. Notification types supported are violation and alert.
   */
  type: "violation" | "alert"
  /**
   * The optional subtype of notification.
   */
  subtype?: string | undefined
  /**
   * The optional position in the coordinate list where the notification occurred, relative to the start of the leg it's on.
   */
  geometry_index?: number | undefined
  /**
   * The optional position in the coordinate list where the notification began, relative to the start of the leg it's on.
   */
  geometry_index_start?: number | undefined
  /**
   * The optional position in the coordinate list where the notification ended, relative to the start of the leg it's on.
   */
  geometry_index_end?: number | undefined
  /**
   * The optional details specific to the notification type and subtype.
   */
  details?: NotificationDetails | undefined
}

interface NotificationDetails {
  /**
   * The optional requested value in the request.
   */
  requested_value?: string | undefined
  /**
   * The optional actual value associated with the property of the road.
   */
  actual_value?: string | undefined
  /**
   * The optional unit of measure associated with details.actual_value and details.requested_value.
   */
  unit?: string | undefined
  /**
   * The optional message of the notification.
   */
  message?: string | undefined
}

interface Step {
  /**
   * Array of objects representing all intersections along the step.
   */
  intersections: Intersection[]
  /**
   * The legal driving side at the location for this step. Either left or right.
   */
  driving_side: DirectionsSide
  /**
   * Depending on the geometries parameter this is a GeoJSON LineString or a
   * Polyline string representing the full route geometry from this RouteStep to the next RouteStep
   */
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString
  /**
   * String indicating the mode of transportation. Possible values:
   */
  mode: DirectionsMode
  /**
   * One StepManeuver object
   */
  maneuver: Maneuver
  /**
   * Any road designations associated with the road or path leading from this step's maneuver to the next step's maneuver.
   * Optionally included, if data is available. If multiple road designations are associated with the road, they are separated by semicolons.
   * A road designation typically consists of an alphabetic network code (identifying the road type or numbering system), a space or hyphen,
   * and a route number. You should not assume that the network code is globally unique: for example, a network code of "NH" may appear on a
   * "National Highway" or "New Hampshire". Moreover, a route number may not even uniquely identify a road within a given network.
   */
  ref?: string | undefined
  weight: number
  /**
   * Number indicating the estimated time traveled time in seconds from the maneuver to the next RouteStep.
   */
  duration: number
  /**
   * String with the name of the way along which the travel proceeds
   */
  name: string
  /**
   * Number indicating the distance traveled in meters from the maneuver to the next RouteStep.
   */
  distance: number
  voiceInstructions: VoiceInstruction[]
  bannerInstructions: BannerInstruction[]
  /**
   * String with the destinations of the way along which the travel proceeds. Optionally included, if data is available.
   */
  destinations?: string | undefined
  /**
   * String with the exit numbers or names of the way. Optionally included, if data is available.
   */
  exits?: string | undefined
  /**
   * A string containing an IPA phonetic transcription indicating how to pronounce the name in the name property.
   * This property is omitted if pronunciation data is unavailable for the step.
   */
  pronunciation?: string | undefined
}

interface Instruction {
  /**
   * String that contains all the text that should be displayed.
   */
  text: string
  /**
   * Objects that, together, make up what should be displayed in the banner.
   * Includes additional information intended to be used to aid in visual layout
   */
  components: Component[]
  /**
   * The type of maneuver. May be used in combination with the modifier (and, if it is a roundabout, the degrees) to for an icon to
   * display. Possible values: 'turn', 'merge', 'depart', 'arrive', 'fork', 'off ramp', 'roundabout'
   */
  type?: string | undefined
  /**
   * The modifier for the maneuver. Can be used in combination with the type (and, if it is a roundabout, the degrees)
   * to for an icon to display. Possible values: 'left', 'right', 'slight left', 'slight right', 'sharp left', 'sharp right', 'straight', 'uturn'
   */
  modifier?: ManeuverModifier | undefined
  /**
   * The degrees at which you will be exiting a roundabout, assuming 180 indicates going straight through the roundabout.
   */
  degrees?: number | undefined
  /**
   * A string representing which side the of the street people drive on in that location. Can be 'left' or 'right'.
   */
  driving_side: DirectionsSide
}

interface BannerInstruction {
  /**
   * Float indicating in meters, how far from the upcoming maneuver
   * the banner instruction should begin being displayed. Only 1 banner should be displayed at a time.
   */
  distanceAlongGeometry: number
  /**
   * Most important content to display to the user. Our SDK displays this text larger and at the top.
   */
  primary: Instruction
  /**
   * Additional content useful for visual guidance. Our SDK displays this text slightly smaller and below the primary. Can be null.
   */
  secondary?: Instruction[] | undefined
  then?: any
  /**
   * Additional information that is included if we feel the driver needs a heads up about something.
   * Can include information about the next maneuver (the one after the upcoming one) if the step is short -
   * can be null, or can be lane information. If we have lane information, that trumps information about the next maneuver.
   */
  sub?: Sub | undefined
}

interface Sub {
  /**
   * String that contains all the text that should be displayed.
   */
  text: string
  /**
   * Objects that, together, make up what should be displayed in the banner.
   * Includes additional information intended to be used to aid in visual layout
   */
  components: Component[]
}

interface Component {
  /**
   * String giving you more context about the component which may help in visual markup/display choices.
   * If the type of the components is unknown it should be treated as text. Note: Introduction of new types
   * is not considered a breaking change. See the Types of Banner Components table below for more info on each type.
   */
  type: string
  /**
   * The sub-string of the parent object's text that may have additional context associated with it.
   */
  text: string
  /**
   * The abbreviated form of text. If this is present, there will also be an abbr_priority value.
   * See the Examples of Abbreviations table below for an example of using abbr and abbr_priority.
   */
  abbr?: string | undefined
  /**
   * An integer indicating the order in which the abbreviation abbr should be used in place of text.
   * The highest priority is 0 and a higher integer value means it should have a lower priority. There are no gaps in
   * integer values. Multiple components can have the same abbr_priority and when this happens all components with the
   * same abbr_priority should be abbreviated at the same time. Finding no larger values of abbr_priority means that the
   * string is fully abbreviated.
   */
  abbr_priority?: number | undefined
  /**
   * String pointing to a shield image to use instead of the text.
   */
  imageBaseURL?: string | undefined
  /**
   * (present if component is lane): An array indicating which directions you can go from a lane (left, right, or straight).
   * If the value is ['left', 'straight'], the driver can go straight or left from that lane
   */
  directions?: string[] | undefined
  /**
   * (present if component is lane): A boolean telling you if that lane can be used to complete the upcoming maneuver.
   * If multiple lanes are active, then they can all be used to complete the upcoming maneuver.
   */
  active: boolean
}

interface VoiceInstruction {
  /**
   * Float indicating in meters, how far from the upcoming maneuver the voice instruction should begin.
   */
  distanceAlongGeometry: number
  /**
   * String containing the text of the verbal instruction.
   */
  announcement: string
  /**
   * String with SSML markup for proper text and pronunciation. Note: this property is designed for use with Amazon Polly.
   * The SSML tags contained here may not work with other text-to-speech engines.
   */
  ssmlAnnouncement: string
}

interface Maneuver {
  /**
   * Number between 0 and 360 indicating the clockwise angle from true north to the direction of travel right after the maneuver
   */
  bearing_after: number
  /**
   * Number between 0 and 360 indicating the clockwise angle from true north to the direction of travel right before the maneuver
   */
  bearing_before: number
  /**
   * Array of [ longitude, latitude ] coordinates for the point of the maneuver
   */
  location: number[]
  /**
   * Optional String indicating the direction change of the maneuver
   */
  modifier?: ManeuverModifier | undefined
  /**
   * String indicating the type of maneuver
   */
  type: ManeuverType
  /**
   * A human-readable instruction of how to execute the returned maneuver
   */
  instruction: string
}

interface Intersection {
  /**
   * Index into the bearings/entry array. Used to extract the bearing after the turn. Namely, The clockwise angle from true north to
   * the direction of travel after the maneuver/passing the intersection.
   * The value is not supplied for arrive maneuvers.
   */
  out?: number | undefined
  /**
   * A list of entry flags, corresponding in a 1:1 relationship to the bearings.
   * A value of true indicates that the respective road could be entered on a valid route.
   * false indicates that the turn onto the respective road would violate a restriction.
   */
  entry: boolean[]
  /**
   * A list of bearing values (for example [0,90,180,270]) that are available at the intersection.
   * The bearings describe all available roads at the intersection.
   */
  bearings: number[]
  /**
   * A [longitude, latitude] pair describing the location of the turn.
   */
  location: number[]
  /**
   * Index into bearings/entry array. Used to calculate the bearing before the turn. Namely, the clockwise angle from true
   * north to the direction of travel before the maneuver/passing the intersection. To get the bearing in the direction of driving,
   * the bearing has to be rotated by a value of 180. The value is not supplied for departure maneuvers.
   */
  in?: number | undefined
  /**
   * An array of strings signifying the classes of the road exiting the intersection.
   */
  classes?: DirectionsClass[] | undefined
  /**
   * Array of Lane objects that represent the available turn lanes at the intersection.
   * If no lane information is available for an intersection, the lanes property will not be present.
   */
  lanes: Lane[]
}

interface Lane {
  /**
   * Boolean value for whether this lane can be taken to complete the maneuver. For instance, if the lane array has four objects and the
   * first two are marked as valid, then the driver can take either of the left lanes and stay on the route.
   */
  valid: boolean
  /**
   * Array of signs for each turn lane. There can be multiple signs. For example, a turning lane can have a sign with an arrow pointing left and another sign with an arrow pointing straight.
   */
  indications: string[]
}