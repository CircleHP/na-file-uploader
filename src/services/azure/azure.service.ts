import { injectable } from "tsyringe";
import {
  BlobDownloadResponseModel,
  BlobServiceClient,
  BlobUploadCommonResponse,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { AZURE_ACCOUNT_ID, AZURE_ACCOUNT_KEY } from "../../common/env";
import { EAzureContainer } from "./enums";

@injectable()
export class AzureService {
  private readonly sharedKeyCredential: StorageSharedKeyCredential;
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    this.sharedKeyCredential = new StorageSharedKeyCredential(
      AZURE_ACCOUNT_ID!,
      AZURE_ACCOUNT_KEY!
    );
    this.blobServiceClient = new BlobServiceClient(
      `https://${AZURE_ACCOUNT_ID}.blob.core.windows.net`,
      this.sharedKeyCredential
    );
  }

  async getBlobFromContainer(
    container: EAzureContainer,
    file_name: string
  ): Promise<BlobDownloadResponseModel> {
    const blobClient = this.blobServiceClient
      .getContainerClient(container)
      .getBlobClient(file_name);

    return blobClient.download();
  }

  async uploadFileToContainer(
    container: EAzureContainer,
    blob_name: string,
    file: {
      path: string;
      type: string | null;
    }
  ): Promise<BlobUploadCommonResponse> {
    const containerClient =
      this.blobServiceClient.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob_name);
    const blockBlobClient = blobClient.getBlockBlobClient();

    return blockBlobClient.uploadFile(file.path, {
      blobHTTPHeaders: {
        blobContentType: file.type ?? undefined,
      },
    });
  }
}
