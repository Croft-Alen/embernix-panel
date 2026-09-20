import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

import type {
  StorageCopyInput,
  StorageGetResult,
  StorageGetStreamResult,
  StorageHeadResult,
  StorageListInput,
  StorageListResult,
  StoragePresignedGetInput,
  StoragePresignedGetResult,
  StoragePresignedPutInput,
  StoragePresignedPutResult,
  StorageProvider,
  StoragePutInput,
  StoragePutResult,
} from "@/server/providers/storage/storage-provider";

type R2Config = {
  accountId:
    string;

  accessKeyId:
    string;

  secretAccessKey:
    string;

  bucketName:
    string;
};

export class R2StorageProvider
  implements
    StorageProvider
{
  private readonly client:
    S3Client;

  private readonly bucketName:
    string;

  constructor(
    config:
      R2Config
  ) {
    this.bucketName =
      config.bucketName;

    this.client =
      new S3Client({
        region:
          "auto",

        endpoint:
          `https://${config.accountId}.r2.cloudflarestorage.com`,

        credentials: {
          accessKeyId:
            config.accessKeyId,

          secretAccessKey:
            config.secretAccessKey,
        },
      });
  }

  async put(
    input:
      StoragePutInput
  ): Promise<
    StoragePutResult
  > {
    const key =
      normalizeKey(
        input.key
      );

    const body =
      typeof input.body ===
      "string"
        ? Buffer.from(
            input.body,
            "utf8"
          )
        : Buffer.from(
            input.body
          );

    const result =
      await this.client.send(
        new PutObjectCommand({
          Bucket:
            this.bucketName,

          Key:
            key,

          Body:
            body,

          ContentType:
            input.contentType,

          Metadata:
            input.metadata,
        })
      );

    return {
      key,

      etag:
        normalizeEtag(
          result.ETag
        ),
    };
  }

  async get(
    key:
      string
  ): Promise<
    StorageGetResult | null
  > {
    const normalizedKey =
      normalizeKey(
        key
      );

    try {
      const result =
        await this.client.send(
          new GetObjectCommand({
            Bucket:
              this.bucketName,

            Key:
              normalizedKey,
          })
        );

      if (
        !result.Body
      ) {
        return null;
      }

      const bytes =
        await result.Body
          .transformToByteArray();

      return {
        key:
          normalizedKey,

        body:
          bytes,

        contentType:
          result.ContentType ??
          null,

        contentLength:
          result.ContentLength ??
          bytes.byteLength,

        etag:
          normalizeEtag(
            result.ETag
          ),

        metadata:
          result.Metadata ??
          {},
      };
    } catch (
      error
    ) {
      if (
        isNotFoundError(
          error
        )
      ) {
        return null;
      }

      throw error;
    }
  }

  async getStream(
    key:
      string
  ): Promise<
    StorageGetStreamResult | null
  > {
    const normalizedKey =
      normalizeKey(
        key
      );

    try {
      const result =
        await this.client.send(
          new GetObjectCommand({
            Bucket:
              this.bucketName,

            Key:
              normalizedKey,
          })
        );

      if (
        !result.Body
      ) {
        return null;
      }

      return {
        key:
          normalizedKey,

        body:
          createUint8ArrayIterable(
            result.Body
          ),

        contentType:
          result.ContentType ??
          null,

        contentLength:
          result.ContentLength ??
          0,

        etag:
          normalizeEtag(
            result.ETag
          ),

        metadata:
          result.Metadata ??
          {},
      };
    } catch (
      error
    ) {
      if (
        isNotFoundError(
          error
        )
      ) {
        return null;
      }

      throw error;
    }
  }

  async head(
    key:
      string
  ): Promise<
    StorageHeadResult | null
  > {
    const normalizedKey =
      normalizeKey(
        key
      );

    try {
      const result =
        await this.client.send(
          new HeadObjectCommand({
            Bucket:
              this.bucketName,

            Key:
              normalizedKey,
          })
        );

      return {
        key:
          normalizedKey,

        contentType:
          result.ContentType ??
          null,

        contentLength:
          result.ContentLength ??
          0,

        etag:
          normalizeEtag(
            result.ETag
          ),

        metadata:
          result.Metadata ??
          {},
      };
    } catch (
      error
    ) {
      if (
        isNotFoundError(
          error
        )
      ) {
        return null;
      }

      throw error;
    }
  }

  async list(
    input:
      StorageListInput = {}
  ): Promise<
    StorageListResult
  > {
    const limit =
      Math.min(
        Math.max(
          input.limit ??
            1000,
          1
        ),
        1000
      );

    const result =
      await this.client.send(
        new ListObjectsV2Command({
          Bucket:
            this.bucketName,

          Prefix:
            input.prefix
              ? normalizePrefix(
                  input.prefix
                )
              : undefined,

          ContinuationToken:
            input.cursor,

          MaxKeys:
            limit,
        })
      );

    return {
      objects:
        (
          result.Contents ??
          []
        ).flatMap(
          (
            object
          ) => {
            if (
              !object.Key
            ) {
              return [];
            }

            return [
              {
                key:
                  object.Key,

                size:
                  object.Size ??
                  0,

                etag:
                  normalizeEtag(
                    object.ETag
                  ),

                lastModified:
                  object.LastModified ??
                  null,
              },
            ];
          }
        ),

      cursor:
        result.NextContinuationToken,

      hasMore:
        Boolean(
          result.IsTruncated
        ),
    };
  }

  async delete(
    key:
      string
  ) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket:
          this.bucketName,

        Key:
          normalizeKey(
            key
          ),
      })
    );
  }

  async copy(
    input:
      StorageCopyInput
  ) {
    const sourceKey =
      normalizeKey(
        input.sourceKey
      );

    const destinationKey =
      normalizeKey(
        input.destinationKey
      );

    await this.client.send(
      new CopyObjectCommand({
        Bucket:
          this.bucketName,

        Key:
          destinationKey,

        CopySource:
          encodeCopySource(
            this.bucketName,
            sourceKey
          ),
      })
    );
  }

  async createPresignedPutUrl(
    input:
      StoragePresignedPutInput
  ): Promise<
    StoragePresignedPutResult
  > {
    const key =
      normalizeKey(
        input.key
      );

    const expiresIn =
      clampExpiration(
        input.expiresInSeconds
      );

    const command =
      new PutObjectCommand({
        Bucket:
          this.bucketName,

        Key:
          key,

        ContentType:
          input.contentType,
      });

    const url =
      await getSignedUrl(
        this.client,
        command,
        {
          expiresIn,
        }
      );

    return {
      key,
      url,
    };
  }

  async createPresignedGetUrl(
    input:
      StoragePresignedGetInput
  ): Promise<
    StoragePresignedGetResult
  > {
    const key =
      normalizeKey(
        input.key
      );

    const expiresIn =
      clampExpiration(
        input.expiresInSeconds
      );

    const fileName =
      input.downloadFileName
        ? sanitizeDownloadFileName(
            input.downloadFileName
          )
        : undefined;

    const command =
      new GetObjectCommand({
        Bucket:
          this.bucketName,

        Key:
          key,

        ResponseContentDisposition:
          fileName
            ? `attachment; filename="${fileName}"`
            : "attachment",
      });

    const url =
      await getSignedUrl(
        this.client,
        command,
        {
          expiresIn,
        }
      );

    return {
      key,
      url,
    };
  }
}

let provider:
  R2StorageProvider | null =
  null;

export function getR2StorageProvider() {
  if (
    provider
  ) {
    return provider;
  }

  provider =
    new R2StorageProvider(
      getR2Config()
    );

  return provider;
}

function getR2Config():
  R2Config {
  const accountId =
    process.env
      .CLOUDFLARE_ACCOUNT_ID;

  const accessKeyId =
    process.env
      .R2_ACCESS_KEY_ID;

  const secretAccessKey =
    process.env
      .R2_SECRET_ACCESS_KEY;

  const bucketName =
    process.env
      .R2_BUCKET_NAME;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName
  ) {
    throw new Error(
      "R2 configuration is incomplete."
    );
  }

  return {
    accountId,

    accessKeyId,

    secretAccessKey,

    bucketName,
  };
}

function createUint8ArrayIterable(
  body:
    unknown
): AsyncIterable<
  Uint8Array
> {
  if (
    !body ||
    typeof body !==
      "object" ||
    !(
      Symbol.asyncIterator in
      body
    )
  ) {
    throw new Error(
      "R2 response body is not streamable."
    );
  }

  const source =
    body as
      AsyncIterable<
        unknown
      >;

  return {
    async *[
      Symbol.asyncIterator
    ]() {
      for await (
        const chunk
        of source
      ) {
        if (
          chunk instanceof
          Uint8Array
        ) {
          yield chunk;

          continue;
        }

        if (
          typeof chunk ===
          "string"
        ) {
          yield Buffer.from(
            chunk
          );

          continue;
        }

        if (
          ArrayBuffer.isView(
            chunk
          )
        ) {
          yield new Uint8Array(
            chunk.buffer,
            chunk.byteOffset,
            chunk.byteLength
          );

          continue;
        }

        if (
          chunk instanceof
          ArrayBuffer
        ) {
          yield new Uint8Array(
            chunk
          );

          continue;
        }

        throw new Error(
          "R2 returned an unsupported stream chunk."
        );
      }
    },
  };
}

function normalizeKey(
  value:
    string
) {
  const key =
    value
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      )
      .replace(
        /\/+/g,
        "/"
      );

  if (
    !key
  ) {
    throw new Error(
      "Storage object key cannot be empty."
    );
  }

  return key;
}

function normalizePrefix(
  value:
    string
) {
  return value
    .replace(
      /\\/g,
      "/"
    )
    .replace(
      /^\/+/,
      ""
    )
    .replace(
      /\/+/g,
      "/"
    );
}

function normalizeEtag(
  value:
    | string
    | undefined
    | null
) {
  if (
    !value
  ) {
    return null;
  }

  return value.replace(
    /^"|"$/g,
    ""
  );
}

function encodeCopySource(
  bucket:
    string,
  key:
    string
) {
  return encodeURIComponent(
    `${bucket}/${key}`
  ).replace(
    /%2F/g,
    "/"
  );
}

function clampExpiration(
  value?:
    number
) {
  return Math.min(
    Math.max(
      value ??
        300,
      60
    ),
    900
  );
}

function sanitizeDownloadFileName(
  value:
    string
) {
  return value
    .replace(
      /[\r\n"]/g,
      ""
    )
    .replace(
      /[\\/]/g,
      "_"
    )
    .trim()
    .slice(
      0,
      200
    );
}

function isNotFoundError(
  error:
    unknown
) {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return false;
  }

  const candidate =
    error as {
      name?:
        string;

      $metadata?: {
        httpStatusCode?:
          number;
      };
    };

  return (
    candidate.name ===
      "NotFound" ||
    candidate.name ===
      "NoSuchKey" ||
    candidate.$metadata
      ?.httpStatusCode ===
      404
  );
}