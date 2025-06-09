'use strict';

var v = require('./service-helpers/validator');
var createServiceFactory = require('./service-helpers/create-service-factory');
var objectClean = require('./service-helpers/object-clean');
var stringifyBooleans = require('./service-helpers/stringify-booleans');

/**
 * Directions API service.
 *
 * Learn more about this service and its responses in
 * [the HTTP service documentation](https://docs.mapbox.com/api/navigation/#directions).
 */
var Directions = {};

/**
 * @typedef {Object} TimeZoneInformation
 * @property {string} identifier - A unique string that specifies a time zone in the format of Region/Location, for example `America/New_York` or `Europe/Paris`, as defined by the IANA Time Zone Database.
 * @property {string} offset - The difference in hours and minutes between a specific time zone and Coordinated Universal Time (UTC), for example `-05:00` for Eastern Standard Time or `+01:00` for Central European Time.
 * @property {string} [abbreviation] - A short, commonly recognized abbreviation for a time zone, often used for display purposes, for example `EST` for Eastern Standard Time or `CET` for Central European Time.
 */

/**
 * @typedef {Object} ChargingWaypointMetadata
 * @property {string} type - The type of charging waypoint, typically "charging-station".
 * @property {string} name - The name of the charging station.
 * @property {number} charge_time - The time required to charge at this station, in seconds.
 * @property {number} charge_to - The charge level after charging, in watt-hours.
 * @property {number} charge_at_arrival - The charge level when arriving at the station, in watt-hours.
 * @property {string} plug_type - The type of charging plug, e.g., "ccs_combo_type2".
 * @property {number} power_kw - The charging power in kilowatts.
 * @property {string} station_id - The unique identifier for the charging station.
 * @property {Array<string>} provider_names - Array of provider names for the charging station.
 */

/**
 * @typedef {Object} DirectionsWaypoint
 * @property {string} name - The name of the road or path to which the input coordinate has been snapped.
 * @property {Array<number>} location - The snapped coordinate as `[longitude, latitude]`.
 * @property {TimeZoneInformation} [time_zone] - An object describing time zone relevant information. This is only available for `driving-traffic`, `driving` and `walking` profiles.
 * @property {number} [distance] - The straight-line distance from the coordinate specified in the query to the location it was snapped to.
 * @property {ChargingWaypointMetadata|null} [metadata] - An object describing charging stops inserted by EV Routing for routes requiring charging along the way. Its set to `null` for user provided waypoints including start & end locations.
 */

/**
 * @typedef {Object} ViaWaypoint
 * @property {number} waypoint_index - The associated waypoint index, excluding the origin (index 0) and destination.
 * @property {number} distance_from_start - The calculated distance, in meters, from the leg origin.
 * @property {number} geometry_index - The associated leg shape index of the via waypoint location.
 */

/**
 * @typedef {Object} LaneObject
 * @property {boolean} valid - Indicates whether a lane can be used to complete the maneuver (`true`) or not (`false`).
 * @property {boolean} [active] - Indicates whether a lane is a *preferred* lane (`true`) or not (`false`). Only available on the `mapbox/driving` profile.
 * @property {string} [valid_indication] - When either the `valid` or `active` value is `true`, this property shows which of the lane `indications` applies to the current route. Only available on the `mapbox/driving` profile.
 * @property {Array<string>} indications - The indications (based on signs, road markings, or both) for a lane.
 * @property {Object} [access] - Access restrictions for the lane.
 * @property {Array<string>} [access.designated] - Indicates whether a lane is designated to specified vehicle types.
 */

/**
 * @typedef {Object} IntersectionObject
 * @property {Array<number>} location - A `[longitude, latitude]` pair describing the location of the turn.
 * @property {Array<number>} bearings - A list of bearing values that are available at the intersection.
 * @property {Array<string>} [classes] - An array of strings signifying the classes of the road exiting the intersection.
 * @property {Array<boolean>} entry - A list of entry flags, corresponding with the entries in `bearings`.
 * @property {number} [geometry_index] - The zero-based index into the geometry, relative to the start of the leg it's on.
 * @property {number} [in] - The index in the `bearings` and `entry` arrays. Used to calculate the bearing before the turn.
 * @property {number} [out] - The index in the `bearings` and `entry` arrays. Used to extract the bearing after the turn.
 * @property {Array<LaneObject>} [lanes] - An array of lane objects that represent the available turn lanes at the intersection.
 * @property {number} [duration] - The time required, in seconds, to traverse the intersection. Only available on the `driving` profile.
 * @property {string} [tunnel_name] - The name of the tunnel when the road exiting the intersection continues in a tunnel. Only available on the `driving` profile.
 */

/**
 * @typedef {Object} StepManeuverObject
 * @property {number} bearing_before - A number between `0` and `360` indicating the clockwise angle from true north to the direction of travel *before* the maneuver.
 * @property {number} bearing_after - A number between `0` and `360` indicating the clockwise angle from true north to the direction of travel *after* the maneuver.
 * @property {string} instruction - A human-readable instruction of how to execute the returned maneuver.
 * @property {Array<number>} location - The coordinates of the maneuver as `[longitude, latitude]`.
 * @property {string} [modifier] - The direction change of the maneuver.
 * @property {string} type - Indicates the type of maneuver.
 */

/**
 * @typedef {Object} VoiceInstructionObject
 * @property {number} distanceAlongGeometry - A float indicating how far from the upcoming maneuver the voice instruction should begin, in meters.
 * @property {string} announcement - The text of the verbal instruction.
 * @property {string} ssmlAnnouncement - Contains SSML markup for proper text and pronunciation.
 */

/**
 * @typedef {Object} BannerComponentObject
 * @property {string} type - Contains more context about the component that may help in visual markup and display choices.
 * @property {string} text - The sub-string of the `text` of the parent objects that may have additional context associated with it.
 * @property {string} [abbr] - The abbreviated form of `text`.
 * @property {number} [abbr_priority] - Indicates the order in which the abbreviation `abbr` should be used in place of `text`.
 * @property {string} [imageBaseURL] - Points to a shield image to use instead of the text.
 * @property {Array<string>} [directions] - Indicates which directions you can go from a lane. Present if `type` is `lane`.
 * @property {boolean} [active] - Indicates whether the lane is recommended for performing the upcoming maneuver. Present if `type` is `lane`.
 * @property {string} [active_direction] - When `active` is `true`, this property shows which of the lane's `directions` applies to the current route. Only available on the `mapbox/driving` profile.
 */

/**
 * @typedef {Object} BannerContentObject
 * @property {string} text - All the text that should be displayed.
 * @property {string} [type] - The type of maneuver.
 * @property {string} [modifier] - The modifier for the maneuver.
 * @property {number} [degrees] - The degrees at which you will be exiting a roundabout.
 * @property {string} [driving_side] - The side of the street on which people drive in that location.
 * @property {Array<BannerComponentObject>} components - An array of objects that, together, make up what should be displayed in the banner.
 */

/**
 * @typedef {Object} BannerInstructionObject
 * @property {number} distanceAlongGeometry - A float indicating how far from the upcoming maneuver the banner instruction should begin being displayed, in meters.
 * @property {BannerContentObject} primary - The most important content to display to the user.
 * @property {BannerContentObject|null} [secondary] - Additional content useful for visual guidance.
 * @property {BannerContentObject} [sub] - Additional information that is included if the driver needs to be notified about something.
 */

/**
 * @typedef {Object} RouteStepObject
 * @property {StepManeuverObject} maneuver - One step maneuver object.
 * @property {number} distance - The distance traveled, in meters, from the maneuver to the next route step.
 * @property {number} duration - The estimated time traveled, in seconds, from the maneuver to the next route step.
 * @property {number} weight - The weight in units described by `weight_name`.
 * @property {number} [duration_typical] - When using the driving-traffic profile, this will be returned as sign of duration of the step under typical conditions.
 * @property {number} [weight_typical] - When using the driving-traffic profile, this will be returned as sign of the weight of the step under typical conditions.
 * @property {Feature<LineString>|Feature<MultiLineString>|string} geometry - Depending on the `geometries` parameter, this is a GeoJSON LineString or a Polyline string representing the full route geometry.
 * @property {string} name - The name of the road or path that forms part of the route step.
 * @property {string} [ref] - Any road designations associated with the road or path leading from this step's maneuver to the next step's maneuver.
 * @property {string} [destinations] - The destinations of the road or path along which the travel proceeds.
 * @property {string} [exits] - The exit numbers or names of the road or path.
 * @property {string} driving_side - The legal driving side at the location for this step. Either `left` or `right`.
 * @property {string} mode - The mode of transportation.
 * @property {string} [pronunciation] - An IPA phonetic transcription indicating how to pronounce the name in the `name` property.
 * @property {Array<IntersectionObject>} intersections - An array of objects representing all the intersections along the step.
 * @property {string} [speedLimitSign] - The design of speed limit signs along the route step, either `mutcd` or `vienna`.
 * @property {string} [speedLimitUnit] - The unit of measurement for speed that is used locally along the step, either `km/h` or `mph`.
 * @property {Array<VoiceInstructionObject>} [voiceInstructions] - An array of voice instruction objects. Only present when `voice_instructions=true`.
 * @property {Array<BannerInstructionObject>} [bannerInstructions] - An array of banner instruction objects. Only present when `banner_instructions=true`.
 */

/**
 * @typedef {Object} IncidentObject
 * @property {string} id - The unique ID of the incident.
 * @property {string} type - The type of incident.
 * @property {string} description - A short description of the incident in a human-readable format.
 * @property {string} long_description - A long description of the incident in a human-readable format.
 * @property {string} creation_time - The time this incident was last created as an incident on the map in ISO-8601 format.
 * @property {string} start_time - The time this incident was started or is expected to start in ISO-8601 format.
 * @property {string} end_time - The time this incident ended or is expected to end in ISO-8601 format.
 * @property {string} impact - The impact of the incident on local traffic.
 * @property {Array<string>} lanes_blocked - Lanes that are blocked by the incident.
 * @property {number} num_lanes_blocked - The number of items in the `lanes_blocked` array.
 * @property {Object} congestion - Contains information about the amount of congestion on the road around the incident.
 * @property {number} congestion.value - A number between `0` and `101` representing the level of congestion caused by the incident.
 * @property {boolean} closed - If this is `true` then the road has been completely closed.
 * @property {number} geometry_index_start - The position in the coordinate list where the incident began.
 * @property {number} geometry_index_end - The position in the coordinate list where the incident ended.
 * @property {string} [sub_type] - Additional information about the type of incident.
 * @property {string} [sub_type_description] - Detail about the value of the `sub_type` field.
 * @property {string} iso_3166_1_alpha2 - The two-letter ISO 3166-1 alpha-2 code for the country the incident is located in.
 * @property {string} iso_3166_1_alpha3 - The three-letter ISO 3166-1 alpha-3 code for the country the incident is located in.
 * @property {Array<string>} affected_road_names - List of roads names affected by the incident.
 * @property {number} south - The incident bounding box south latitude coordinate as float.
 * @property {number} west - The incident bounding box west longitude coordinate as float.
 * @property {number} north - The incident bounding box north latitude coordinate as float.
 * @property {number} east - The incident bounding box east longitude coordinate as float.
 */

/**
 * @typedef {Object} NotificationDetailsObject
 * @property {string} [requested_value] - The requested value in the request.
 * @property {string} [actual_value] - The actual value associated with the property of the road.
 * @property {string} [unit] - The unit of measure associated with `actual_value` and `requested_value`.
 * @property {string} [message] - The message of the notification.
 */

/**
 * @typedef {Object} NotificationObject
 * @property {string} type - The type of notifications. Either `violation` or `alert`.
 * @property {string} [subtype] - The optional subtype of notification.
 * @property {number} [geometry_index] - The optional position in the coordinate list where the notification occurred.
 * @property {number} [geometry_index_start] - The optional position in the coordinate list where the notification began.
 * @property {number} [geometry_index_end] - The optional position in the coordinate list where the notification ended.
 * @property {NotificationDetailsObject} [details] - The optional details specific to the notification type and subtype.
 */

/**
 * @typedef {Object} RouteAnnotationObject
 * @property {Array<string>} [congestion] - The level of congestion between each entry in the array of coordinate pairs.
 * @property {Array<number|null>} [congestion_numeric] - The level of congestion in numeric form, from 0-100.
 * @property {Array<number>} [distance] - The distance between each pair of coordinates, in meters.
 * @property {Array<number>} [duration] - The duration between each pair of coordinates, in seconds.
 * @property {Array<Object>} [maxspeed] - The local posted speed limit between each pair of coordinates.
 * @property {Array<number>} [state_of_charge] - The battery's current state of charge as a percentage of the maximum capacity.
 * @property {Array<number>} [speed] - The average speed used in the calculation between the two points in each pair of coordinates.
 */

/**
 * @typedef {Object} AdminObject
 * @property {string} iso_3166_1 - Contains the two-letter ISO 3166-1 alpha-2 code that applies to a country boundary.
 * @property {string} iso_3166_1_alpha3 - Contains the three-letter ISO 3166-1 alpha-3 code that applies to a country boundary.
 */

/**
 * @typedef {Object} RouteLegObject
 * @property {number} distance - The distance traveled between waypoints, in meters.
 * @property {number} duration - The estimated travel time between waypoints, in seconds.
 * @property {number} weight - The weight in units described by `weight_name`.
 * @property {number} [duration_typical] - When using the driving-traffic profile, this will be returned as sign of duration of the leg under typical conditions.
 * @property {number} [weight_typical] - When using the driving-traffic profile, this will be returned as sign of the weight of the leg under typical conditions.
 * @property {Array<RouteStepObject>} steps - Depending on the optional `steps` parameter, either an array of route step objects or an empty array.
 * @property {string} summary - A summary of major roads traversed in this leg of the route.
 * @property {Array<AdminObject>} admins - An array of objects describing the administrative boundaries the route leg travels through.
 * @property {Array<IncidentObject>} [incidents] - An array of incident objects describing temporary events that occur along the roadway.
 * @property {Array<Object>} [closures] - Included in the route leg object when making a `mapbox/driving-traffic` request with `annotations=closure,...`.
 * @property {RouteAnnotationObject} [annotation] - An annotations object that contains additional details about each line segment along the route geometry.
 * @property {Array<ViaWaypoint>} [via_waypoints] - When the semicolon-separated list `waypoints` parameter is used in the request, an array per leg is returned.
 * @property {Array<NotificationObject>} [notifications] - An optional array of notification objects describing notifications about the route.
 */

/**
 * @typedef {Object} RouteObject
 * @property {number} duration - The estimated travel time through the waypoints, in seconds.
 * @property {number} distance - The distance traveled through the waypoints, in meters.
 * @property {string} weight_name - Specifies the weight used, which by default is duration-based and includes additional penalties for less desirable maneuvers.
 * @property {number} weight - A numeric value representing desirability of a route, where a lower weight indicates a more favorable route.
 * @property {number} [duration_typical] - When using the `driving-traffic` profile, this will be returned as a float indicating the duration of the route under typical conditions.
 * @property {number} [weight_typical] - When using the `driving-traffic` profile, this will be returned as a float indicating the weight of the selected route under typical conditions.
 * @property {Feature<LineString>|Feature<MultiLineString>|string} geometry - Depending on the `geometries` query parameter, this is either a GeoJSON LineString or a Polyline string.
 * @property {Array<RouteLegObject>} legs - An array of route leg objects.
 * @property {string} [voiceLocale] - The locale used for voice instructions. Only present when `voice_instructions=true`.
 * @property {Array<DirectionsWaypoint>} [waypoints] - When the input parameter `waypoints_per_route=true` is used, the waypoints will appear in the route object.
 */

/**
 * @typedef {Object} DirectionsResponse
 * @property {Array<RouteObject>} routes - An array of route objects.
 * @property {Array<DirectionsWaypoint>} waypoints - An array of waypoint objects representing all waypoints in order.
 * @property {string} code - Indicates the state of the response.
 * @property {string} [uuid] - Unique identifier for the request.
 */

/**
 * @typedef {Object} DirectionsWaypointInput
 * @property {Coordinates} coordinates
 * @property {'unrestricted'|'curb'} [approach="unrestricted"] - Used to indicate how requested routes consider from which side of the road to approach the waypoint.
 * @property {[number, number]} [bearing] - Used to filter the road segment the waypoint will be placed on by direction and dictates the angle of approach.
 *   This option should always be used in conjunction with a `radius`. The first value is an angle clockwise from true north between 0 and 360,
 *   and the second is the range of degrees the angle can deviate by.
 * @property {number|'unlimited'} [radius] - Maximum distance in meters that the coordinate is allowed to move when snapped to a nearby road segment.
 * @property {string} [waypointName] - Custom name for the waypoint used for the arrival instruction in banners and voice instructions.
 */

/**
 * Get directions.
 *
 * Please read [the full HTTP service documentation](https://docs.mapbox.com/api/navigation/#directions)
 * to understand all of the available options.
 *
 * @param {Object} config
 * @param {'driving-traffic'|'driving'|'walking'|'cycling'} [config.profile="driving"]
 * @param {Array<DirectionsWaypointInput>} config.waypoints - An ordered array of waypoint input objects, between 2 and 25 (inclusive).
 * @param {boolean} [config.alternatives=false] - Whether to try to return alternative routes.
 * @param {Array<'duration'|'distance'|'speed'|'congestion'|'congestion_numeric'|'maxspeed'|'closure'|'state_of_charge'>} [config.annotations] - Specify additional metadata that should be returned.
 * @param {boolean} [config.bannerInstructions=false] - Should be used in conjunction with `steps`.
 * @param {boolean} [config.continueStraight] - Sets the allowed direction of travel when departing intermediate waypoints.
 * @param {string} [config.exclude] - Exclude certain road types from routing. See HTTP service documentation for options.
 * @param {'geojson'|'polyline'|'polyline6'} [config.geometries="polyline"] - Format of the returned geometry.
 * @param {string} [config.language="en"] - Language of returned turn-by-turn text instructions.
 *   See options listed in [the HTTP service documentation](https://docs.mapbox.com/api/navigation/#instructions-languages).
 * @param {'simplified'|'full'|'false'} [config.overview="simplified"] - Type of returned overview geometry.
 * @param {boolean} [config.roundaboutExits=false] - Emit instructions at roundabout exits.
 * @param {boolean} [config.steps=false] - Whether to return steps and turn-by-turn instructions.
 * @param {boolean} [config.voiceInstructions=false] - Whether or not to return SSML marked-up text for voice guidance along the route.
 * @param {'imperial'|'metric'} [config.voiceUnits="imperial"] - Which type of units to return in the text for voice instructions.
 * @param {'electric_no_recharge'|'electric'} [config.engine="electric_no_recharge"] - Set to electric to enable electric vehicle routing.
 * @param {number} [config.ev_initial_charge] - Optional parameter to specify initial charge of vehicle in Wh (watt-hours) at the beginning of the route.
 * @param {number} [config.ev_max_charge] - Required parameter that defines the maximum possible charge of vehicle in Wh (watt-hours).
 * @param {'ccs_combo_type1'|'ccs_combo_type2'|'tesla'} [config.ev_connector_types] - Required parameter that defines the compatible connector-types for the vehicle.
 * @param {string} [config.energy_consumption_curve] - Required parameter that specifies in pairs the energy consumption in watt-hours per kilometer at a certain speed in kph.
 * @param {string} [config.ev_charging_curve] - Required parameter that specifies the maximum battery charging rate (W) at a given charge level (Wh) in a list of pairs.
 * @param {string} [config.ev_unconditioned_charging_curve] - Optional parameter that specifies the maximum battery charging rate (W) at a given charge level (Wh) in a list of pairs when the battery is in an unconditioned state (eg: cold).
 * @param {number} [config.ev_pre_conditioning_time] - Optional parameter that defines the time in minutes it would take for the vehicle's battery to condition.
 * @param {number} [config.ev_max_ac_charging_power] - Optional parameter to specify maximum AC charging power(W) that can be delivered by the onboard vehicle charger.
 * @param {number} [config.ev_min_charge_at_destination] - Optional parameter to define the minimum battery charge required at the final route destination (Wh).
 * @param {number} [config.ev_min_charge_at_charging_station] - Optional parameter to define the minimum charge when arriving at the charging station (Wh).
 * @param {number} [config.auxiliary_consumption] - Optional parameter to define the measure of the continuous power draw of the auxiliary systems in watts (E.G heating or AC).
 * @param {number} [config.maxHeight=1.6] - Optional parameter to define the max vehicle height in meters.
 * @param {number} [config.maxWidth=1.9] - Optional parameter to define the max vehicle width in meters.
 * @param {number} [config.maxWeight=2.5] - Optional parameter to define the max vehicle weight in metric tons.
 * @param {string} [config.notifications="all"] - Returns notification metadata associated with the route leg of the route object.
 * @param {string} [config.departAt] - Optional parameter to define the departure time, formatted as a timestamp in ISO-8601 format in the local time at the route origin.
 * @param {string} [config.arriveBy] - Optional parameter to define the desired arrival time, formatted as a timestamp in ISO-8601 format in the local time at the route destination.
 * @param {boolean} [config.waypoints_per_route=false] - When true, the waypoints will appear in the route object and display an array of waypoint objects specific to that route.
 * @return {MapiRequest<DirectionsResponse>} A request object that will resolve to a DirectionsResponse when sent.
 *
 * @example
 * directionsClient.getDirections({
 *   profile: 'driving-traffic',
 *   waypoints: [
 *     {
 *       coordinates: [13.4301, 52.5109],
 *       approach: 'unrestricted'
 *     },
 *     {
 *       coordinates: [13.4265, 52.508]
 *     },
 *     {
 *       coordinates: [13.4194, 52.5072],
 *       bearing: [100, 60]
 *     }
 *   ],
 *   steps: true,
 *   voice_instructions: true,
 *   banner_instructions: true,
 *   annotations: ['duration', 'distance', 'congestion']
 * })
 *   .send()
 *   .then(response => {
 *     // response.body is a DirectionsResponse object
 *     const directions = response.body;
 *     console.log('Found', directions.routes.length, 'routes');
 *     directions.routes.forEach((route, index) => {
 *       console.log(`Route ${index}: ${route.distance}m, ${route.duration}s`);
 *       route.legs.forEach((leg, legIndex) => {
 *         console.log(`  Leg ${legIndex}: ${leg.summary}`);
 *         if (leg.steps) {
 *           leg.steps.forEach((step, stepIndex) => {
 *             console.log(`    Step ${stepIndex}: ${step.maneuver.instruction}`);
 *           });
 *         }
 *       });
 *     });
 *   });
 */
Directions.getDirections = function(config) {
  v.assertShape({
    profile: v.oneOf('driving-traffic', 'driving', 'walking', 'cycling'),
    waypoints: v.required(
      v.arrayOf(
        v.shape({
          coordinates: v.required(v.coordinates),
          approach: v.oneOf('unrestricted', 'curb'),
          bearing: v.arrayOf(v.range([0, 360])),
          radius: v.oneOfType(v.number, v.equal('unlimited')),
          waypointName: v.string
        })
      )
    ),
    alternatives: v.boolean,
    annotations: v.arrayOf(
      v.oneOf(
        'duration',
        'distance',
        'speed',
        'congestion',
        'congestion_numeric',
        'maxspeed',
        'closure',
        'state_of_charge'
      )
    ),
    bannerInstructions: v.boolean,
    continueStraight: v.boolean,
    exclude: v.string,
    geometries: v.string,
    language: v.string,
    overview: v.string,
    roundaboutExits: v.boolean,
    steps: v.boolean,
    voiceInstructions: v.boolean,
    voiceUnits: v.string,
    engine: v.string,
    ev_initial_charge: v.number,
    ev_max_charge: v.number,
    ev_connector_types: v.string,
    energy_consumption_curve: v.string,
    ev_charging_curve: v.string,
    ev_unconditioned_charging_curve: v.string,
    ev_pre_conditioning_time: v.number,
    ev_max_ac_charging_power: v.number,
    ev_min_charge_at_destination: v.number,
    ev_min_charge_at_charging_station: v.number,
    auxiliary_consumption: v.number,
    maxHeight: v.number,
    maxWidth: v.number,
    maxWeight: v.number,
    notifications: v.string,
    departAt: v.string,
    arriveBy: v.string,
    waypoints_per_route: v.boolean
  })(config);

  config.profile = config.profile || 'driving';

  var path = {
    coordinates: [],
    approach: [],
    bearing: [],
    radius: [],
    waypointName: []
  };

  var waypointCount = config.waypoints.length;
  if (waypointCount < 2 || waypointCount > 25) {
    throw new Error('waypoints must include between 2 and 25 waypoint objects');
  }

  config.waypoints.forEach(function(waypoint) {
    path.coordinates.push(
      waypoint.coordinates[0] + ',' + waypoint.coordinates[1]
    );

    // join props which come in pairs
    ['bearing'].forEach(function(prop) {
      if (waypoint.hasOwnProperty(prop) && waypoint[prop] != null) {
        waypoint[prop] = waypoint[prop].join(',');
      }
    });

    ['approach', 'bearing', 'radius', 'waypointName'].forEach(function(prop) {
      if (waypoint.hasOwnProperty(prop) && waypoint[prop] != null) {
        path[prop].push(waypoint[prop]);
      } else {
        path[prop].push('');
      }
    });
  });

  ['approach', 'bearing', 'radius', 'waypointName'].forEach(function(prop) {
    // avoid sending params which are all `;`
    if (
      path[prop].every(function(char) {
        return char === '';
      })
    ) {
      delete path[prop];
    } else {
      path[prop] = path[prop].join(';');
    }
  });

  var query = stringifyBooleans({
    alternatives: config.alternatives,
    annotations: config.annotations,
    banner_instructions: config.bannerInstructions,
    continue_straight: config.continueStraight,
    exclude: config.exclude,
    geometries: config.geometries,
    language: config.language,
    overview: config.overview,
    roundabout_exits: config.roundaboutExits,
    steps: config.steps,
    voice_instructions: config.voiceInstructions,
    voice_units: config.voiceUnits,
    approaches: path.approach,
    bearings: path.bearing,
    radiuses: path.radius,
    waypoint_names: path.waypointName,
    engine: config.engine,
    ev_initial_charge: config.ev_initial_charge,
    ev_max_charge: config.ev_max_charge,
    ev_connector_types: config.ev_connector_types,
    energy_consumption_curve: config.energy_consumption_curve,
    ev_charging_curve: config.ev_charging_curve,
    ev_unconditioned_charging_curve: config.ev_unconditioned_charging_curve,
    ev_pre_conditioning_time: config.ev_pre_conditioning_time,
    ev_max_ac_charging_power: config.ev_max_ac_charging_power,
    ev_min_charge_at_destination: config.ev_min_charge_at_destination,
    ev_min_charge_at_charging_station: config.ev_min_charge_at_charging_station,
    auxiliary_consumption: config.auxiliary_consumption,
    max_height: config.maxHeight,
    max_width: config.maxWidth,
    max_weight: config.maxWeight,
    notifications: config.notifications,
    depart_at: config.departAt,
    arrive_by: config.arriveBy,
    waypoints_per_route: config.waypoints_per_route
  });

  return this.client.createRequest({
    method: 'GET',
    path: '/directions/v5/mapbox/:profile/:coordinates',
    params: {
      profile: config.profile,
      coordinates: path.coordinates.join(';')
    },
    query: objectClean(query)
  });
};

module.exports = createServiceFactory(Directions);
