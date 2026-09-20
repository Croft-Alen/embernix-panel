export type StoragePutInput = {
  key: string;

  body:
    | Uint8Array
    | Buffer
    | string;

  contentType?: string;

  metadata?: Record<
    string,
    string
  >;
};

export type StoragePutResult = {
  key: string;

  etag:
    | string
    | null;
};

export type StorageGetResult = {
  key: string;

  body:
    Uint8Array;

  contentType:
    | string
    | null;

  contentLength:
    number;

  etag:
    | string
    | null;

  metadata:
    Record<
      string,
      string
    >;
};

export type StorageGetStreamResult = {
  key: string;

  body:
    AsyncIterable<
      Uint8Array
    >;

  contentType:
    | string
    | null;

  contentLength:
    number;

  etag:
    | string
    | null;

  metadata:
    Record<
      string,
      string
    >;
};

export type StorageHeadResult = {
  key: string;

  contentType:
    | string
    | null;

  contentLength:
    number;

  etag:
    | string
    | null;

  metadata:
    Record<
      string,
      string
    >;
};

export type StorageObject = {
  key: string;

  size: number;

  etag:
    | string
    | null;

  lastModified:
    | Date
    | null;
};

export type StorageListInput = {
  prefix?: string;

  cursor?: string;

  limit?: number;
};

export type StorageListResult = {
  objects:
    StorageObject[];

  cursor?: string;

  hasMore:
    boolean;
};

export type StorageCopyInput = {
  sourceKey:
    string;

  destinationKey:
    string;
};

export type StoragePresignedPutInput = {
  key: string;

  contentType?: string;

  expiresInSeconds?: number;
};

export type StoragePresignedPutResult = {
  key: string;

  url: string;
};

export type StoragePresignedGetInput = {
  key: string;

  expiresInSeconds?: number;

  downloadFileName?: string;
};

export type StoragePresignedGetResult = {
  key: string;

  url: string;
};

export interface StorageProvider {
  put(
    input:
      StoragePutInput
  ): Promise<
    StoragePutResult
  >;

  get(
    key: string
  ): Promise<
    StorageGetResult | null
  >;

  getStream(
    key: string
  ): Promise<
    StorageGetStreamResult | null
  >;

  head(
    key: string
  ): Promise<
    StorageHeadResult | null
  >;

  list(
    input?:
      StorageListInput
  ): Promise<
    StorageListResult
  >;

  delete(
    key: string
  ): Promise<void>;

  copy(
    input:
      StorageCopyInput
  ): Promise<void>;

  createPresignedPutUrl(
    input:
      StoragePresignedPutInput
  ): Promise<
    StoragePresignedPutResult
  >;

  createPresignedGetUrl(
    input:
      StoragePresignedGetInput
  ): Promise<
    StoragePresignedGetResult
  >;
}