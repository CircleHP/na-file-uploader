import { ExceptionError } from "../abstract/exception-error";
import { HttpStatus } from "../enums/http-status";

export class NotFoundException extends ExceptionError {
  constructor(msg?: string) {
    super(HttpStatus.NOT_FOUND, msg ?? NotFoundException.name);
  }
}
