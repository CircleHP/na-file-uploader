import { ExceptionError } from "../abstract/exception-error";
import { HttpStatus } from "../enums/http-status";

export class InternalServerErrorException extends ExceptionError {
  constructor(msg?: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      msg ?? InternalServerErrorException.name
    );
  }
}
