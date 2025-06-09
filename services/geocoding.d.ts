/// <reference types="node" />

import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

/*********************************************************************************************************************
 * Geocoding Types
 *********************************************************************************************************************/
export default function Geocoding(config: SdkConfig | MapiClient): GeocodeService

interface GeocodeService {
  forwardGeocode(request: GeocodeRequest): MapiRequest<GeocodeResponse>
  reverseGeocode(request: GeocodeRequest): MapiRequest<GeocodeResponse>
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
  | "poi.landmark"

interface GeocodeRequest {
  /**
   * A location. This will be a place name for forward geocoding or coordinates for reverse geocoding.
   */
  query: string | [number, number]
  /**
   * Limit results to one or more countries. Options are ISO 3166 alpha 2 country codes separated by commas.
   */
  countries?: string[] | undefined
  /**
   * Specify the user's language. This parameter controls the language of the text supplied in responses, and also affects result scoring, with results matching the user's query in the requested language being preferred over results that match in another language. For example, an autocomplete query for things that start with Frank might return Frankfurt as the first result with an English (en) language parameter, but Frankreich ("France" in German) with a German (de) language parameter. Options are IETF language tags comprised of a mandatory ISO 639-1 language code and optionally one or more IETF subtags for country or script.
   */
  language?: string | undefined
  /**
   * Limit results to only those contained within the supplied bounding box. Options are in the format minX,minY,maxX,maxY.
   */
  bbox?: [number, number, number, number] | undefined
  /**
   * Filter results to include only a subset (one or more) of the available feature types. Options are country, region, postcode, district, place, locality, neighborhood, address, and poi. Additionally, the poi type can be filtered further by category using the syntax poi.category, where category can be any accepted value from the Mapbox Streets source's type_en property for POIs. For example, poi.restaurant would limit results to restaurants.
   */
  types?: GeocodeQueryType[] | undefined
  /**
   * Specify whether to request additional metadata about the recommended geocode. Options are address and iso_3166_1.
   */
  worldview?: string | undefined
  /**
   * Limit the number of results returned. Options are integers between 1 and 10. The default is 5 for forward geocoding and 1 for reverse geocoding.
   */
  limit?: number | undefined
  /**
   * Decide how results are sorted in a forward geocoding query. Options are distance (default) and relevance. distance sorts results by their distance from the proximity point, closest first. relevance sorts results by their relevance to the query, most relevant first.
   */
  routing?: boolean | undefined
  /**
   * Specify whether the Geocoding API should attempt approximate, as well as exact, matching when performing forward geocoding queries. Options are true (default) and false.
   */
  fuzzyMatch?: boolean | undefined
  /**
   * Bias local results based on a provided coordinate location. Options are longitude,latitude coordinates.
   */
  proximity?: [number, number] | undefined
  /**
   * Return autocomplete results or not. Options are true and false (default).
   */
  autocomplete?: boolean | undefined
}

interface GeocodeResponse {
  /**
   * "Forward" for forward geocoding, "Reverse" for reverse geocoding.
   */
  type: string
  /**
   * An array of space and punctuation-separated strings from the original query.
   */
  query: string[]
  /**
   * An array of feature objects.
   */
  features: GeocodeFeature[]
  /**
   * A string attributing the results of the Mapbox Geocoding API to Mapbox and links to Mapbox's terms of service and data sources.
   */
  attribution: string
}

interface GeocodeFeature {
  /**
   * A string feature id in the form {type}.{id} where {type} is the lowest hierarchy feature in the place_type field. The {id} suffix of the feature id is unstable and may change within versions.
   */
  id: string
  /**
   * "Feature", a GeoJSON type from the GeoJSON specification.
   */
  type: "Feature"
  /**
   * An array of feature types describing the feature. Options are country, region, postcode, district, place, locality, neighborhood, address, and poi. Most features have only one type, but if the feature has multiple types, all applicable types will be listed in the array. (For example, Vatican City is a country, region, and place.)
   */
  place_type: GeocodeQueryType[]
  /**
   * Numerical score from 0 (least relevant) to 0.99 (most relevant) measuring how well each returned feature matches the query. You can use the relevance property to remove results that don't fully match the query.
   */
  relevance: number
  /**
   * A string representing the feature in the requested language, if specified.
   */
  place_name: string
  /**
   * A string representing the feature in the language used locally for that feature.
   */
  place_name_language?: string | undefined
  /**
   * A string of the house number for the returned address feature. Note that unlike the address parameter in a query, this property is outside the properties object.
   */
  address?: string | undefined
  /**
   * An object describing the spatial geometry of the returned feature.
   */
  geometry: Geometry
  /**
   * An object describing the feature. The property object is unstable and only Carmen GeoJSON properties are guaranteed. The Carmen GeoJSON specification is not published and subject to change.
   */
  properties: GeocodeProperties
  /**
   * An array representing the hierarchy of encompassing parent features. Each parent feature may include any of the above properties.
   */
  context?: GeocodeFeature[] | undefined
  /**
   * An array of bounding box coordinates in the form [minX,minY,maxX,maxY].
   */
  bbox?: [number, number, number, number] | undefined
  /**
   * A point array in the form [longitude,latitude].
   */
  center: [number, number]
}

interface Geometry {
  /**
   * "Point", a GeoJSON type from the GeoJSON specification.
   */
  type: "Point"
  /**
   * An array in the format [longitude,latitude] at the center of the specified bbox.
   */
  coordinates: [number, number]
  /**
   * Indicates how the coordinates were determined.
   */
  interpolated?: boolean | undefined
  /**
   * Indicates that the result is approximate.
   */
  omitted?: boolean | undefined
}

interface GeocodeProperties extends GeocodeFeature {
  /**
   * The ISO 3166-1 country and ISO 3166-2 subdivision code for the returned feature.
   */
  short_code?: string | undefined
  /**
   * The Wikidata identifier for the returned feature.
   */
  wikidata?: string | undefined
}