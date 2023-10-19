export abstract class ExceptionError extends Error {
  _exceptionError = true;

  protected constructor(public statusCode: number, msg: string) {
    super(msg);
  }
}

export const isExceptionError = (obj: any): obj is ExceptionError =>
  obj._exceptionError;
