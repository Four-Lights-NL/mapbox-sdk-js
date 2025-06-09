/// <reference types="node" />

import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Styles(config: SdkConfig | MapiClient): StylesService

interface StylesService {
  /**
   * Get a style.
   */
  getStyle(config: {
    styleId: string
    ownerId?: string | undefined
    metadata?: boolean | undefined
    draft?: boolean | undefined
  }): MapiRequest<Style>
  /**
   * Create a style.
   */
  createStyle(config: { style: Style; ownerId?: string | undefined }): MapiRequest<Style>
  /**
   * Update a style.
   */
  updateStyle(config: {
    styleId: string
    style: Style
    ownerId?: string | undefined
    lastKnownModification?: string | undefined
  }): MapiRequest<Style>
  /**
   * Delete a style.
   */
  deleteStyle(config: { styleId: string; ownerId?: string | undefined }): MapiRequest
  /**
   * List styles.
   */
  listStyles(config: {
    ownerId?: string | undefined
    start?: string | undefined
    fresh?: boolean | undefined
  }): MapiRequest<Style[]>
  /**
   * Add an icon to a style's sprite.
   */
  putStyleIcon(config: {
    styleId: string
    iconId: string
    file: Blob | ArrayBuffer | string | NodeJS.ReadStream
    ownerId?: string | undefined
  }): MapiRequest
  /**
   * Remove an icon from a style's sprite.
   */
  deleteStyleIcon(config: {
    styleId: string
    iconId: string
    ownerId?: string | undefined
  }): MapiRequest
  /**
   * Get a style's sprite image or JSON document.
   */
  getStyleSprite(config: {
    styleId: string
    format: "json" | "png"
    highDPI?: boolean | undefined
    ownerId?: string | undefined
    draft?: boolean | undefined
  }): MapiRequest
  /**
   * Get font glyph ranges.
   */
  getFontGlyphRange(config: {
    fonts: string[]
    start: number
    end: number
    ownerId?: string | undefined
  }): MapiRequest
  /**
   * Get embeddable HTML displaying a map.
   */
  getEmbeddableHtml(config: {
    styleId: string
    zoomwheel?: boolean | undefined
    title?: boolean | undefined
    fallback?: boolean | undefined
    mapboxgl?: string | undefined
    draft?: boolean | undefined
    ownerId?: string | undefined
  }): MapiRequest<string>
}

interface Style {
  /**
   * The style's version. Mapbox uses version 8 of the style specification.
   */
  version: number
  /**
   * A human-readable name for the style.
   */
  name?: string | undefined
  /**
   * Arbitrary properties useful to track with the stylesheet; does not influence rendering.
   */
  metadata?: any
  /**
   * The global light source.
   */
  light?: any
  /**
   * A base URL for retrieving the sprite image and metadata.
   */
  sprite?: string | undefined
  /**
   * A URL template for loading signed-distance-field glyph sets in PBF format.
   */
  glyphs?: string | undefined
  /**
   * Data source specifications.
   */
  sources?: { [sourceName: string]: any }
  /**
   * Layers will be drawn in the order of this array.
   */
  layers?: any[]
  /**
   * Default map center in longitude and latitude.
   */
  center?: [number, number] | undefined
  /**
   * Default zoom level.
   */
  zoom?: number | undefined
  /**
   * Default bearing, in degrees.
   */
  bearing?: number | undefined
  /**
   * Default pitch, in degrees.
   */
  pitch?: number | undefined
  /**
   * The style's owner.
   */
  owner?: string | undefined
  /**
   * The style's ID.
   */
  id?: string | undefined
  /**
   * The style's access token.
   */
  accessToken?: string | undefined
  /**
   * Whether the style is draft.
   */
  draft?: boolean | undefined
  /**
   * The date and time the style was created.
   */
  created?: string | undefined
  /**
   * The date and time the style was last modified.
   */
  modified?: string | undefined
  /**
   * The style's visibility.
   */
  visibility?: "private" | "public" | undefined
}