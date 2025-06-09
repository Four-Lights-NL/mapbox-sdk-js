/// <reference types="node" />

import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Tilesets(config: SdkConfig | MapiClient): TilesetsService

interface TilesetsService {
  /**
   * List tilesets for an account.
   */
  listTilesets(config: {
    ownerId?: string | undefined
    type?: "raster" | "vector" | undefined
    limit?: number | undefined
    sortBy?: "created" | "modified" | undefined
    start?: string | undefined
    visibility?: "public" | "private" | undefined
  }): MapiRequest<Tileset[]>
  /**
   * Create a tileset source.
   */
  createTilesetSource(config: {
    id: string
    file: Blob | ArrayBuffer | string | NodeJS.ReadStream
    ownerId?: string | undefined
  }): MapiRequest
  /**
   * List tileset sources for an account.
   */
  listTilesetSources(config: {
    ownerId?: string | undefined
    limit?: number | undefined
    start?: string | undefined
  }): MapiRequest
  /**
   * Create a tileset.
   */
  createTileset(config: {
    tilesetId: string
    recipe: any
    name: string
    ownerId?: string | undefined
    private?: boolean | undefined
  }): MapiRequest
  /**
   * Update a tileset.
   */
  updateTileset(config: {
    tilesetId: string
    recipe?: any
    name?: string | undefined
    description?: string | undefined
    private?: boolean | undefined
    ownerId?: string | undefined
  }): MapiRequest
  /**
   * Get tileset job information.
   */
  listTilesetJobs(config: {
    tilesetId: string
    stage?: string | undefined
    limit?: number | undefined
    start?: string | undefined
    ownerId?: string | undefined
  }): MapiRequest
}

interface Tileset {
  /**
   * The tileset's unique identifier.
   */
  id: string
  /**
   * The tileset's name.
   */
  name: string
  /**
   * The tileset's description.
   */
  description?: string | undefined
  /**
   * The tileset's attribution.
   */
  attribution?: Array<{
    text: string
    link?: string | undefined
  }> | undefined
  /**
   * The tileset's type.
   */
  type: "raster" | "vector"
  /**
   * The tileset's visibility.
   */
  visibility: "public" | "private"
  /**
   * The tileset's status.
   */
  status: "available" | "pending" | "invalid"
  /**
   * The date and time the tileset was created.
   */
  created: string
  /**
   * The date and time the tileset was last modified.
   */
  modified: string
  /**
   * The tileset's file size in bytes.
   */
  filesize?: number | undefined
}