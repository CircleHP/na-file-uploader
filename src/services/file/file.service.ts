import { injectable } from "tsyringe";
import { IncomingMessage } from "http";
import { File, IncomingForm } from "formidable";
import { ExtractFileConfig } from "./types";
import { BadRequestException } from "../../core/exceptions/BadRequestException";
import { ErrorMessages } from "../../common/errors";

@injectable()
export class FileService {
  async extractFilesOrThrow(
    req: IncomingMessage,
    config?: Partial<ExtractFileConfig>
  ): Promise<File[]> {
    const form = new IncomingForm();

    const [_, formDataFiles] = await form.parse(req);

    const files = Object.values(formDataFiles)
      .flatMap((file) => file)
      .filter((file) => file) as File[];

    if (!config) {
      return files;
    }

    if (!files.length) {
      throw new BadRequestException(ErrorMessages.NO_FILES_UPLOADED);
    }

    if (config.max_count && files.length > config.max_count) {
      throw new BadRequestException(ErrorMessages.TOO_MANY_FILES);
    }

    if (config.min_count && files.length < config.min_count) {
      throw new BadRequestException(ErrorMessages.TOO_LITTLE_FILES);
    }

    return files;
  }
}
