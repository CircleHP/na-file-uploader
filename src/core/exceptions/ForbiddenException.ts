import { ExceptionError } from "../abstract/exception-error";
import { HttpStatus } from "../enums/http-status";

export class ForbiddenException extends ExceptionError {
  constructor(msg?: string) {
    super(HttpStatus.FORBIDDEN, msg ?? ForbiddenException.name);
  }
}
