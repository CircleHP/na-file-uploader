import { EMimeType } from "../../../core/enums/mime-type";

export interface RootFileResponse {
  stream: NodeJS.ReadableStream;
  type: EMimeType;
}

export interface RoofFileUploadResponse {
  filename: string;
  access_key: string | undefined;
}
