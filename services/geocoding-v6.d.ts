/// <reference types="node" />

import type { Coordinates as MapiRequestCoordinates, MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

/*********************************************************************************************************************
 * Geocoder Types for v6 API
 *********************************************************************************************************************/

export default function GeocodeV6(config: SdkConfig | MapiClient): GeocodeService

interface GeocodeService {
  forwardGeocode(request: StandardGeocodeRequest | StructuredGeocodeRequest): MapiRequest<GeocodeResponse>
  reverseGeocode(request: ReverseGeocodeRequest): MapiRequest<GeocodeResponse>
}

type GeocodeQueryType =
  | "country"
  | "region"
  | "postcode"
  | "district"
  | "place"
  | "locality"
  | "neighborhood"
  | "address"
  | "poi"

interface GeocodeV6Request {
  /**
   * Limit results to one or more countries. Options are ISO 3166 alpha 2 country codes separated by commas.
   */
  country?: string[] | undefined
  /**
   * Specify the user's language. This parameter controls the language of the text supplied in responses.
   */
  language?: string[] | undefined
  /**
   * Limit the number of results returned.
   */
  limit?: number | undefined
  /**
   * Bias local results based on a provided coordinate location.
   */
  proximity?: MapiRequestCoordinates | undefined
  /**
   * Filter results to include only a subset of the available feature types.
   */
  types?: GeocodeQueryType[] | undefined
  /**
   * Specify the desired worldview for disputed boundaries.
   */
  worldview?: string | undefined
}

interface BaseForwardGeocodeRequest extends GeocodeV6Request {
  /**
   * Return autocomplete results or not.
   */
  autocomplete?: boolean | undefined
  /**
   * Limit results to only those contained within the supplied bounding box.
   */
  bbox?: [number, number, number, number] | undefined
  /**
   * Specify whether the Geocoding API should attempt approximate, as well as exact, matching.
   */
  fuzzy_match?: boolean | undefined
  /**
   * Decide how results are sorted in a forward geocoding query.
   */
  navigation_profile?: "driving" | "walking" | "cycling" | undefined
}

interface ReverseGeocodeRequest extends GeocodeV6Request {
  /**
   * A point for which you want to retrieve location information.
   */
  coordinates: MapiRequestCoordinates
  /**
   * Specify whether to request additional metadata about the recommended geocode.
   */
  reverseMode?: "distance" | undefined
}

interface StructuredGeocodeRequest extends BaseForwardGeocodeRequest {
  /**
   * The feature's street address.
   */
  address_line1?: string | undefined
  /**
   * The feature's secondary street address information.
   */
  address_line2?: string | undefined
  /**
   * The feature's street number.
   */
  address_number?: string | undefined
  /**
   * The feature's street name.
   */
  street?: string | undefined
  /**
   * The feature's block.
   */
  block?: string | undefined
  /**
   * The feature's place name.
   */
  place?: string | undefined
  /**
   * The feature's region.
   */
  region?: string | undefined
  /**
   * The feature's postcode.
   */
  postcode?: string | undefined
  /**
   * The feature's locality.
   */
  locality?: string | undefined
  /**
   * The feature's neighborhood.
   */
  neighborhood?: string | undefined
  /**
   * The feature's country.
   */
  country_code?: string | undefined
}

interface StandardGeocodeRequest extends BaseForwardGeocodeRequest {
  /**
   * The location you want to search for.
   */
  q: string
}

interface GeocodeResponse {
  /**
   * "FeatureCollection", a GeoJSON type from the GeoJSON specification.
   */
  type: "FeatureCollection"
  /**
   * An array of feature objects.
   */
  features: Feature[]
  /**
   * A string attributing the results of the Mapbox Geocoding API to Mapbox.
   */
  attribution: string
}

interface Feature {
  /**
   * "Feature", a GeoJSON type from the GeoJSON specification.
   */
  type: "Feature"
  /**
   * A string feature id.
   */
  id: string
  /**
   * An object describing the spatial geometry of the returned feature.
   */
  geometry: Geometry
  /**
   * An object describing the feature.
   */
  properties: Properties
}

interface Geometry {
  /**
   * "Point", a GeoJSON type from the GeoJSON specification.
   */
  type: "Point"
  /**
   * An array in the format [longitude,latitude] at the center of the specified bbox.
   */
  coordinates: MapiRequestCoordinates
}

interface Properties extends NamedLocation {
  /**
   * The Mapbox Geocoding API's attribution requirements.
   */
  mapbox_id: string
  /**
   * The type of the returned feature.
   */
  feature_type: GeocodeQueryType
  /**
   * A string representing the feature in the requested language, if specified, or the local language.
   */
  full_address?: string | undefined
  /**
   * A string representing the feature's place name in the requested language, if specified.
   */
  name_preferred?: string | undefined
  /**
   * An object containing the components of the feature's full address.
   */
  coordinates: Coordinates
  /**
   * An array representing the hierarchy of encompassing parent features.
   */
  context?: Context | undefined
  /**
   * An array of bounding box coordinates in the form [minX,minY,maxX,maxY].
   */
  bbox?: [number, number, number, number] | undefined
  /**
   * The ISO 3166-1 country and ISO 3166-2 subdivision code for the returned feature.
   */
  short_code?: string | undefined
  /**
   * The Wikidata identifier for the returned feature.
   */
  wikidata?: string | undefined
  /**
   * A string of the house number for the returned address feature.
   */
  address_number?: string | undefined
  /**
   * A string of the street name for the returned address feature.
   */
  street_name?: string | undefined
  /**
   * Formatted string of result context: place region country postcode.
   */
  place_formatted?: string
}

interface Coordinates {
  /**
   * The longitude of the returned feature.
   */
  longitude: number
  /**
   * The latitude of the returned feature.
   */
  latitude: number
  /**
   * The routable point for the returned feature.
   */
  routable_points?: Array<{
    name: string
    latitude: number
    longitude: number
  }> | undefined
}

interface Context {
  /**
   * The region for the returned feature.
   */
  region?: Region | undefined
  /**
   * The country for the returned feature.
   */
  country?: Country | undefined
  /**
   * The postcode for the returned feature.
   */
  postcode?: IdentifiableLocation | undefined
  /**
   * The place for the returned feature.
   */
  place?: Place | undefined
  /**
   * The locality for the returned feature.
   */
  locality?: IdentifiableLocation | undefined
  /**
   * The neighborhood for the returned feature.
   */
  neighborhood?: IdentifiableLocation | undefined
  /**
   * The street for the returned feature.
   */
  street?: IdentifiableLocation | undefined
  /**
   * The address for the returned feature.
   */
  address?: IdentifiableLocation | undefined
}

interface Region extends NamedLocation {
  /**
   * The region's two-letter code, if available.
   */
  region_code?: string | undefined
  /**
   * The region's two-letter code from ISO 3166-2, if available.
   */
  region_code_full?: string | undefined
}

interface Country extends NamedLocation {
  /**
   * The country's two-letter code from ISO 3166-1.
   */
  country_code: string
  /**
   * The country's three-letter code from ISO 3166-1.
   */
  country_code_alpha_3: string
}

interface Place extends IdentifiableLocation {
  /**
   * The place's Wikidata identifier, if available.
   */
  wikidata_id?: string | undefined
}

interface IdentifiableLocation extends NamedLocation {
  /**
   * The location's Mapbox ID.
   */
  mapbox_id: string
}

interface NamedLocation {
  /**
   * The location's name.
   */
  name: string
  /**
   * The location's name in the local language.
   */
  name_preferred?: string | undefined
}