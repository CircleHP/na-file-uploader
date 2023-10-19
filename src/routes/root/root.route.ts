import type { Handler, HandlerResponse } from "../../core/types";

import { Get, Post } from "../../core/decorators/method";
import { injectable } from "tsyringe";
import { streamToBuffer } from "../../utils/stream/streamToBuffer";
import { RootService } from "./root.service";
import { FileService } from "../../services/file/file.service";
import { RouteEndpoint } from "../../core/decorators/route-endpoint.decorator";

@RouteEndpoint()
@injectable()
export class RootRoute {
  constructor(
    private readonly rootService: RootService,
    private readonly fileService: FileService
  ) {}

  @Get(":file_unique_id")
  async getPublicFile({
    params: { file_unique_id },
    res,
  }: Handler): Promise<HandlerResponse> {
    const result = await this.rootService.getPublicFile(file_unique_id);

    res.writeHead(200, { "Content-Type": result.type });

    return streamToBuffer(result.stream);
  }

  @Get(":file_access_key/:file_unique_id")
  async getPrivateFile({
    params: { file_access_key, file_unique_id },
    res,
  }: Handler): Promise<HandlerResponse> {
    const result = await this.rootService.getPrivateFile(
      file_access_key,
      file_unique_id
    );

    res.writeHead(200, { "Content-Type": result.type });

    return streamToBuffer(result.stream);
  }

  @Post("upload")
  async uploadFile({ req }: Handler): Promise<HandlerResponse> {
    const [file] = await this.fileService.extractFilesOrThrow(req, {
      min_count: 1,
      max_count: 1,
    });

    const file_name = await this.rootService.uploadFile(
      req.headers["private"] === "true",
      file
    );

    return JSON.stringify({ file_name });
  }
}
