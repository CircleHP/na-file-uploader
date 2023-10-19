import { ExceptionError } from "../abstract/exception-error";
import { HttpStatus } from "../enums/http-status";

export class UnauthorizedException extends ExceptionError {
  constructor(msg?: string) {
    super(HttpStatus.UNAUTHORIZED, msg ?? UnauthorizedException.name);
  }
}
