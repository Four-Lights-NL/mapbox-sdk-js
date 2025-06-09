'use strict';

var v = require('./service-helpers/validator');
var createServiceFactory = require('./service-helpers/create-service-factory');
var objectClean = require('./service-helpers/object-clean');
var urlUtils = require('../lib/helpers/url-utils');
var stringifyBooleans = require('./service-helpers/stringify-booleans');

/**
 * Map Matching API service.
 *
 * Learn more about this service and its responses in
 * [the HTTP service documentation](https://docs.mapbox.com/api/navigation/#map-matching).
 */
var MapMatching = {};

/**
 * Snap recorded location traces to roads and paths.
 *
 * @param {Object} config
 * @param {Array<MapMatchingPoint>} config.points - An ordered array of [`MapMatchingPoint`](#mapmatchingpoint)s, between 2 and 100 (inclusive).
 * @param {'driving-traffic'|'driving'|'walking'|'cycling'} [config.profile=driving] - A directions profile ID.
 * @param {Array<'duration'|'distance'|'speed'|'congestion'|'congestion_numeric'|'maxspeed'>} [config.annotations] - Specify additional metadata that should be returned.
 * @param {'geojson'|'polyline'|'polyline6'} [config.geometries="polyline"] - Format of the returned geometry.
 * @param {string} [config.language="en"] - Language of returned turn-by-turn text instructions.
 *   See [supported languages](https://docs.mapbox.com/api/navigation/#instructions-languages).
 * @param {'simplified'|'full'|'false'} [config.overview="simplified"] - Type of returned overview geometry.
 * @param {boolean} [config.steps=false] - Whether to return steps and turn-by-turn instructions.
 * @param {boolean} [config.banner_instructions=false] - Whether to return banner objects associated with the route steps. Must be used in conjunction with `steps=true`.
 * @param {boolean} [config.roundabout_exits=false] - Whether to emit instructions at roundabout exits. Must be used in conjunction with `steps=true`.
 * @param {boolean} [config.voice_instructions=false] - Whether to return SSML marked-up text for voice guidance along the route. Must be used in conjunction with `steps=true`.
 * @param {'imperial'|'british_imperial'|'metric'} [config.voice_units="imperial"] - Specify which type of units to return in the text for voice instructions. Must be used in conjunction with `steps=true` and `voice_instructions=true`.
 * @param {boolean} [config.tidy=false] - Whether or not to transparently remove clusters and re-sample traces for improved map matching results.
 * @param {Array<number>} [config.timestamps] - A semicolon-separated list of numbers in Unix time (in other words, seconds since 1/1/1970 UTC) that correspond to each input coordinate.
 * @param {string} [config.waypoint_names] - A semicolon-separated list of custom names for waypoints.
 * @param {string} [config.waypoints] - A semicolon-separated list indicating which input coordinates should be treated as waypoints.
 * @param {Array<'access'|'oneways'|'restrictions'>} [config.ignore] - Ignore certain routing restrictions when map matching.
 * @param {string} [config.depart_at] - The departure time from the first coordinates, formatted in ISO 8601.
 * @param {boolean} [config.linear_references=false] - Whether to return base64-encoded OpenLR location references.
 * @return {MapiRequest<{matchings: Array<MatchObject>, tracepoints: Array<TracepointObject>}>}
 *
 * @example
 * mapMatchingClient.getMatch({
 *   points: [
 *     {
 *       coordinates: [-117.17283, 32.712041],
 *       approach: 'curb'
 *     },
 *     {
 *       coordinates: [-117.17291, 32.712256],
 *       isWaypoint: false
 *     },
 *     {
 *       coordinates: [-117.17292, 32.712444]
 *     },
 *     {
 *       coordinates: [-117.172922, 32.71257],
 *       waypointName: 'point-a',
 *       approach: 'unrestricted'
 *     },
 *     {
 *       coordinates: [-117.172985, 32.7126]
 *     },
 *     {
 *       coordinates: [-117.173143, 32.712597]
 *     },
 *     {
 *       coordinates: [-117.173345, 32.712546]
 *     }
 *   ],
 *   tidy: false,
 * })
 *   .send()
 *   .then(response => {
 *     const matching = response.body;
 *   })
 */
MapMatching.getMatch = function(config) {
  v.assertShape({
    points: v.required(
      v.arrayOf(
        v.shape({
          coordinates: v.required(v.coordinates),
          approach: v.oneOf('unrestricted', 'curb'),
          radius: v.range([0, 50]),
          isWaypoint: v.boolean,
          waypointName: v.string,
          timestamp: v.date
        })
      )
    ),
    profile: v.oneOf('driving-traffic', 'driving', 'walking', 'cycling'),
    annotations: v.arrayOf(
      v.oneOf(
        'duration',
        'distance',
        'speed',
        'congestion',
        'congestion_numeric',
        'maxspeed'
      )
    ),
    geometries: v.oneOf('geojson', 'polyline', 'polyline6'),
    language: v.string,
    overview: v.oneOf('full', 'simplified', 'false'),
    steps: v.boolean,
    banner_instructions: v.boolean,
    roundabout_exits: v.boolean,
    voice_instructions: v.boolean,
    voice_units: v.oneOf('imperial', 'british_imperial', 'metric'),
    tidy: v.boolean,
    timestamps: v.arrayOf(v.number),
    waypoint_names: v.string,
    waypoints: v.string,
    ignore: v.arrayOf(v.oneOf('access', 'oneways', 'restrictions')),
    depart_at: v.string,
    linear_references: v.boolean
  })(config);

  var pointCount = config.points.length;
  if (pointCount < 2 || pointCount > 100) {
    throw new Error('points must include between 2 and 100 MapMatchingPoints');
  }

  config.profile = config.profile || 'driving';

  var path = {
    coordinates: [],
    approach: [],
    radius: [],
    isWaypoint: [],
    waypointName: [],
    timestamp: []
  };

  /**
   * @typedef {Object} MapMatchingPoint
   * @property {Coordinates} coordinates
   * @property {'unrestricted'|'curb'} [approach="unrestricted"] - Used to indicate how requested routes consider from which side of the road to approach a waypoint.
   * @property {number} [radius=5] - A number in meters indicating the assumed precision of the used tracking device.
   * @property {boolean} [isWaypoint=true] - Whether this coordinate is waypoint or not. The first and last coordinates will always be waypoints.
   * @property {string} [waypointName] - Custom name for the waypoint used for the arrival instruction in banners and voice instructions. Will be ignored unless `isWaypoint` is `true`.
   * @property {string | number | Date} [timestamp] - Datetime corresponding to the coordinate.
   */

  /**
   * A match object is a route object with an additional confidence field.
   *
   * @typedef {Object} MatchObject
   * @property {number} confidence - The level of confidence in the returned match, from 0 (low) to 1 (high).
   * @property {number} distance - The distance traveled, in meters.
   * @property {number} duration - The estimated travel time, in seconds.
   * @property {number} weight - The weight in units described by weight_name.
   * @property {string} weight_name - The weight used. The default is routability, which is duration-based, with additional penalties for less desirable maneuvers.
   * @property {Feature<LineString>|Feature<MultiLineString>|string} geometry - Depending on the geometries parameter in the request, this is a GeoJSON LineString or a Polyline string. Depending on the overview parameter in the request, this is the complete route geometry (full), a simplified geometry to the zoom level at which the route can be displayed in full (simplified), or is not included (false).
   * @property {Array} legs - An array of route leg objects.
   * @property {string} [voice_locale] - The locale used for voice instructions. Defaults to en (English). Requires steps=true.
   * @property {Array<string>} [linear_references] - An array of base64-encoded OpenLR location references, one for each graph edge of the road network matched by the input trace. This key is optional, and present only when linear_references=true in the request.
   */

  /**
   * A tracepoint object is a waypoint object with three additional fields: matchings_index, waypoint_index, and alternatives_count.
   *
   * @typedef {Object} TracepointObject
   * @property {number} matchings_index - The index of the match object in matchings that the sub-trace was matched to.
   * @property {number} waypoint_index - The index of the waypoint inside the matched route.
   * @property {number} alternatives_count - The number of probable alternative matchings for this trace point. A value of 0 indicates that this point was matched unambiguously. Split the trace at these points for incremental map matching.
   * @property {string} name - The name of the road or path the coordinate snapped to.
   * @property {Coordinates} location - An array that contains the location of the snapped coordinate, in the format [longitude, latitude].
   */
  config.points.forEach(function(obj) {
    path.coordinates.push(obj.coordinates[0] + ',' + obj.coordinates[1]);

    // isWaypoint
    if (obj.hasOwnProperty('isWaypoint') && obj.isWaypoint != null) {
      path.isWaypoint.push(obj.isWaypoint);
    } else {
      path.isWaypoint.push(true); // default value
    }

    if (obj.hasOwnProperty('timestamp') && obj.timestamp != null) {
      path.timestamp.push(Number(new Date(obj.timestamp)));
    } else {
      path.timestamp.push('');
    }

    ['approach', 'radius', 'waypointName'].forEach(function(prop) {
      if (obj.hasOwnProperty(prop) && obj[prop] != null) {
        path[prop].push(obj[prop]);
      } else {
        path[prop].push('');
      }
    });
  });

  ['coordinates', 'approach', 'radius', 'waypointName', 'timestamp'].forEach(
    function(prop) {
      // avoid sending params which are all `;`
      if (
        path[prop].every(function(value) {
          return value === '';
        })
      ) {
        delete path[prop];
      } else {
        path[prop] = path[prop].join(';');
      }
    }
  );

  // the api requires the first and last items to be true.
  path.isWaypoint[0] = true;
  path.isWaypoint[path.isWaypoint.length - 1] = true;

  if (
    path.isWaypoint.every(function(value) {
      return value === true;
    })
  ) {
    delete path.isWaypoint;
  } else {
    // the api requires the indexes to be sent
    path.isWaypoint = path.isWaypoint
      .map(function(val, i) {
        return val === true ? i : '';
      })
      .filter(function(x) {
        return x === 0 || Boolean(x);
      })
      .join(';');
  }

  var body = stringifyBooleans(
    objectClean({
      annotations: config.annotations,
      geometries: config.geometries,
      language: config.language,
      overview: config.overview,
      steps: config.steps,
      banner_instructions: config.banner_instructions,
      roundabout_exits: config.roundabout_exits,
      voice_instructions: config.voice_instructions,
      voice_units: config.voice_units,
      tidy: config.tidy,
      linear_references: config.linear_references,
      approaches: path.approach,
      radiuses: path.radius,
      waypoints: path.isWaypoint,
      timestamps: path.timestamp,
      waypoint_names: path.waypointName,
      ignore: config.ignore,
      depart_at: config.depart_at,
      coordinates: path.coordinates
    })
  );

  // the matching api expects a form-urlencoded
  // post request.
  return this.client.createRequest({
    method: 'POST',
    path: '/matching/v5/mapbox/:profile',
    params: {
      profile: config.profile
    },
    body: urlUtils.appendQueryObject('', body).substring(1), // need to remove the char`?`
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });
};

module.exports = createServiceFactory(MapMatching);
