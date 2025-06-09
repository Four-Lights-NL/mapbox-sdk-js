/// <reference types="node" />

import type { MapiRequest } from "@mapbox/mapbox-sdk/lib/classes/mapi-request"
import type MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client"
import type { SdkConfig } from "@mapbox/mapbox-sdk/lib/classes/mapi-client"

export default function Uploads(config: SdkConfig | MapiClient): UploadsService

interface UploadsService {
  /**
   * List uploads for an account.
   */
  listUploads(config?: { reverse?: boolean | undefined; limit?: number | undefined }): MapiRequest<UploadResponse[]>
  /**
   * Create upload credentials.
   */
  createUploadCredentials(): MapiRequest<S3Credentials>
  /**
   * Create an upload.
   */
  createUpload(config: {
    tileset?: string | undefined
    url?: string | undefined
    name?: string | undefined
  }): MapiRequest<UploadResponse>
  /**
   * Get upload status.
   */
  getUpload(config: { uploadId: string }): MapiRequest<UploadResponse>
  /**
   * Delete an upload.
   */
  deleteUpload(config: { uploadId: string }): MapiRequest
}

interface S3Credentials {
  /**
   * The S3 access key ID.
   */
  accessKeyId: string
  /**
   * The S3 secret access key.
   */
  secretAccessKey: string
  /**
   * The S3 session token.
   */
  sessionToken: string
  /**
   * The S3 bucket name.
   */
  bucket: string
  /**
   * The S3 key prefix.
   */
  key: string
  /**
   * The S3 upload URL.
   */
  url: string
}

interface UploadResponse {
  /**
   * The upload's unique identifier.
   */
  id: string
  /**
   * The upload's name.
   */
  name?: string | undefined
  /**
   * The date and time the upload was created.
   */
  created: string
  /**
   * The date and time the upload was last modified.
   */
  modified: string
  /**
   * The upload's owner.
   */
  owner: string
  /**
   * The upload's progress as a percentage.
   */
  progress: number
  /**
   * The upload's current status.
   */
  complete: boolean
  /**
   * Any error message associated with the upload.
   */
  error?: string | undefined
  /**
   * The tileset identifier that will be created from this upload.
   */
  tileset?: string | undefined
}