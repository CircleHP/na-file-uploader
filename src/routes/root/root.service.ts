import { injectable } from "tsyringe";
import { AzureService } from "../../services/azure/azure.service";
import { EAzureContainer } from "../../services/azure/enums";
import { NotFoundException } from "../../core/exceptions/NotFoundException";
import { ErrorMessages } from "../../common/errors";
import { ForbiddenException } from "../../core/exceptions/ForbiddenException";
import { UnauthorizedException } from "../../core/exceptions/UnauthorizedException";
import { InternalServerErrorException } from "../../core/exceptions/InternalServerErrorException";
import { File } from "formidable";
import { MIME_EXT_MAP } from "../../core/map/mime-extension";
import { EMimeType } from "../../core/enums/mime-type";
import { RoofFileUploadResponse, RootFileResponse } from "./types/response";
import { BinaryLike, createHmac } from "crypto";
import { API_KEY } from "../../common/env";

@injectable()
export class RootService {
  constructor(private readonly blobClientService: AzureService) {}

  async getPublicFile(file_name: string): Promise<RootFileResponse> {
    try {
      const response = await this.blobClientService.getBlobFromContainer(
        EAzureContainer.PUBLIC_CONTAINER,
        file_name
      );

      return {
        stream: response.readableStreamBody!,
        type: response.contentType as EMimeType,
      };
    } catch (error: any) {
      this.handleAzureError(error);
      throw error;
    }
  }

  async getPrivateFile(
    access_key: string,
    file_name: string
  ): Promise<RootFileResponse> {
    const validKey = this.generatePrivateKey(file_name);

    console.log(access_key, validKey);

    if (access_key != validKey) {
      throw new UnauthorizedException(ErrorMessages.INVALID_ACCESS_KEY);
    }

    try {
      const response = await this.blobClientService.getBlobFromContainer(
        EAzureContainer.PRIVATE_CONTAINER,
        file_name
      );

      return {
        stream: response.readableStreamBody!,
        type: response.contentType as EMimeType,
      };
    } catch (error: any) {
      this.handleAzureError(error);
      throw error;
    }
  }

  async uploadFile(
    is_private: boolean,
    file: File
  ): Promise<RoofFileUploadResponse> {
    const container: EAzureContainer = is_private
      ? EAzureContainer.PRIVATE_CONTAINER
      : EAzureContainer.PUBLIC_CONTAINER;
    const ext = file.mimetype ? MIME_EXT_MAP[file.mimetype as EMimeType] : "";

    const filename = `${file.newFilename}-${Date.now()}${ext}`;
    let access_key = undefined;

    if (container == EAzureContainer.PRIVATE_CONTAINER) {
      access_key = this.generatePrivateKey(filename);
    }

    try {
      await this.blobClientService.uploadFileToContainer(container, filename, {
        path: file.filepath,
        type: file.mimetype,
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    return { filename, access_key };
  }

  private generatePrivateKey = (data: BinaryLike) => {
    const hmac = createHmac("sha256", API_KEY!);
    hmac.update(data);
    return hmac.digest("hex");
  };

  private handleAzureError = (error: any) => {
    if (!error.statusCode) {
      throw error;
    }

    switch (error.statusCode) {
      case 404:
        throw new NotFoundException(ErrorMessages.FILE_ID_NOT_FOUND);
      case 403:
        throw new ForbiddenException(ErrorMessages.FORBIDDEN_ACCESS);
      case 401:
        throw new UnauthorizedException(ErrorMessages.ACCESS_DENIED);
    }
  };
}
