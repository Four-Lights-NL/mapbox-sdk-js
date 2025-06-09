/// <reference types="node" />

import type * as GeoJSON from "geojson"
import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

/*********************************************************************************************************************
 * Datasets Types
 *********************************************************************************************************************/
export default function Datasets(config: SdkConfig | MapiClient): DatasetsService

interface DatasetsService {
  /**
   * List datasets in your account.
   */
  listDatasets(config?: { sortby?: "created" | "modified" | undefined }): MapiRequest
  /**
   *  Create a new, empty dataset.
   * @param config Object
   */
  createDataset(config: { name?: string | undefined; description?: string | undefined }): MapiRequest
  /**
   * Get metadata about a dataset.
   * @param config
   */
  getMetadata(config: { datasetId: string }): MapiRequest
  /**
   * Update user-defined properties of a dataset's metadata.
   * @param config
   */
  updateMetadata(config: {
    datasetId?: string | undefined
    name?: string | undefined
    description?: string | undefined
  }): MapiRequest
  /**
   * Delete a dataset, including all features it contains.
   * @param config
   */
  deleteDataset(config: { datasetId: string }): MapiRequest
  /**
   * List features in a dataset.
   * This endpoint supports pagination. Use MapiRequest#eachPage or manually specify the limit and start options.
   * @param config
   */
  listFeatures(config: { datasetId: string; limit?: number | undefined; start?: string | undefined }): MapiRequest
  /**
   * Add a feature to a dataset or update an existing one.
   * @param config
   */
  putFeature(config: { datasetId: string; featureId: string; feature: DataSetsFeature }): MapiRequest
  /**
   * Get a feature in a dataset.
   * @param config
   */
  getFeature(config: { datasetId: string; featureId: string }): MapiRequest
  /**
   * Delete a feature in a dataset.
   * @param config
   */
  deleteFeature(config: { datasetId: string; featureId: string }): MapiRequest
}

/**
 * All GeoJSON types except for FeatureCollection.
 */
type DataSetsFeature =
  | GeoJSON.Point
  | GeoJSON.MultiPoint
  | GeoJSON.LineString
  | GeoJSON.MultiLineString
  | GeoJSON.Polygon
  | GeoJSON.MultiPolygon
  | GeoJSON.GeometryCollection
  | GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>

interface Dataset {
  /**
   * The username of the dataset owner
   */
  owner: string
  /**
   * Id for an existing dataset
   */
  id: string
  /*
   * Date and time the dataset was created
   */
  created: string
  /*
   * Date and time the dataset was last modified
   */
  modified: string
  /**
   * The extent of features in the dataset as an array of west, south, east, north coordinates
   */
  bounds: number[]
  /**
   * The number of features in the dataset
   */
  features: number
  /**
   * The size of the dataset in bytes
   */
  size: number
  /**
   * The name of the dataset
   */
  name: string
  /**
   * The description of the dataset
   */
  description: string
}