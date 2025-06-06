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
 * @param {Array<MapMatchingPoint>|string} config.points - An ordered array of [`MapMatchingPoint`](#mapmatchingpoint)s, between 2 and 100 (inclusive), or an OpenLR encoded string.
 * @param {'mapbox/driving-traffic'|'mapbox/driving'|'mapbox/walking'|'mapbox/cycling'} [config.profile="mapbox/driving"] - A directions profile ID.
 * @param {Array<'duration'|'distance'|'speed'|'congestion'|'congestion_numeric'|'maxspeed'>} [config.annotations] - Specify additional metadata that should be returned.
 * @param {'geojson'|'polyline'|'polyline6'} [config.geometries="polyline"] - Format of the returned geometry.
 * @param {string} [config.language="en"] - Language of returned turn-by-turn text instructions.
 *   See [supported languages](https://docs.mapbox.com/api/navigation/#instructions-languages).
 * @param {'simplified'|'full'|'false'} [config.overview="simplified"] - Type of returned overview geometry.
 * @param {boolean} [config.steps=false] - Whether to return steps and turn-by-turn instructions.
 * @param {boolean} [config.tidy=false] - Whether or not to transparently remove clusters and re-sample traces for improved map matching results.
 * @param {'tomtom'|'here'} [config.openLR_spec] - OpenLR specification version. Required when using OpenLR encoded strings.
 * @param {'xml'|'binary'} [config.openLR_format] - OpenLR format. Required when using OpenLR encoded strings.
 * @return {MapiRequest}
 *
 * @example
 * // Using coordinate points
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
 *
 * @example
 * // Using OpenLR encoded string
 * mapMatchingClient.getMatch({
 *   points: "CwRbWyNG9RpsCQDzAQA=",
 *   openLR_spec: "tomtom",
 *   openLR_format: "binary",
 *   profile: "mapbox/driving"
 * })
 *   .send()
 *   .then(response => {
 *     const matching = response.body;
 *   })
 */
MapMatching.getMatch = function(config) {
  v.assertShape({
    points: v.required(
      v.oneOfType(
        v.arrayOf(
          v.shape({
            coordinates: v.required(v.coordinates),
            approach: v.oneOf('unrestricted', 'curb'),
            radius: v.range([0, 50]),
            isWaypoint: v.boolean,
            waypointName: v.string,
            timestamp: v.date
          })
        ),
        v.string // OpenLR encoded string
      )
    ),
    profile: v.oneOf(
      'driving-traffic',
      'driving',
      'walking',
      'cycling',
      'mapbox/driving-traffic',
      'mapbox/driving',
      'mapbox/walking',
      'mapbox/cycling'
    ),
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
    tidy: v.boolean,
    openLR_spec: v.oneOf('tomtom', 'here'),
    openLR_format: v.oneOf('xml', 'binary')
  })(config);

  // Handle OpenLR encoded strings
  if (typeof config.points === 'string') {
    // OpenLR validation
    if (!config.openLR_spec || !config.openLR_format) {
      throw new Error(
        'openLR_spec and openLR_format are required when using OpenLR encoded strings'
      );
    }

    config.profile = config.profile || 'driving';

    // Normalize profile to include mapbox/ prefix if not present
    if (!config.profile.startsWith('mapbox/')) {
      config.profile = 'mapbox/' + config.profile;
    }

    var openLRBody = stringifyBooleans(
      objectClean({
        annotations: config.annotations,
        geometries: config.geometries,
        language: config.language,
        overview: config.overview,
        steps: config.steps,
        tidy: config.tidy,
        openLR_spec: config.openLR_spec,
        openLR_format: config.openLR_format,
        coordinates: config.points
      })
    );

    return this.client.createRequest({
      method: 'POST',
      path: '/matching/v5/mapbox/:profile',
      params: {
        profile: config.profile.replace('mapbox/', '')
      },
      body: urlUtils.appendQueryObject('', openLRBody).substring(1),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });
  }

  // Handle coordinate arrays
  var pointCount = config.points.length;
  if (pointCount < 2 || pointCount > 100) {
    throw new Error('points must include between 2 and 100 MapMatchingPoints');
  }

  config.profile = config.profile || 'mapbox/driving';

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
      tidy: config.tidy,
      approaches: path.approach,
      radiuses: path.radius,
      waypoints: path.isWaypoint,
      timestamps: path.timestamp,
      waypoint_names: path.waypointName,
      coordinates: path.coordinates
    })
  );

  // the matching api expects a form-urlencoded
  // post request.
  return this.client.createRequest({
    method: 'POST',
    path: '/matching/v5/mapbox/:profile',
    params: {
      profile: config.profile.replace('mapbox/', '')
    },
    body: urlUtils.appendQueryObject('', body).substring(1), // need to remove the char`?`
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });
};

module.exports = createServiceFactory(MapMatching);
