import { IncomingMessage } from "http";
import { HandlerMetadata, RouteHandler } from "../types";

export abstract class BaseGuard {
  protected constructor(private guardToken: string) {}

  execute = async (
    req: IncomingMessage,
    handler: RouteHandler
  ): Promise<boolean> => {
    const routeGuardToken = Reflect.getMetadata(
      "guard_token",
      handler.instanceToken
    );
    const handlerMetadata: HandlerMetadata = Reflect.getMetadata(
      handler.handlerKey,
      handler.instance
    );

    if (
      [routeGuardToken, handlerMetadata.guard_token].includes(this.guardToken)
    ) {
      return this.validate(req);
    }
    return true;
  };

  abstract validate(req: IncomingMessage): Promise<boolean> | boolean;
}
