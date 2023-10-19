import { HandlerMetadata } from "../types";

export function UseRouteGuard(guard_token: any) {
  return function (target: any) {
    Reflect.defineMetadata("guard_token", guard_token.name, target);
  };
}

export function UseHandlerGuard(guard_token: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const oldMetadata: HandlerMetadata = Reflect.getMetadata(
      propertyKey,
      target
    );
    const metadata: HandlerMetadata = {
      ...oldMetadata,
      guard_token: guard_token.name,
    };
    Reflect.defineMetadata(propertyKey, metadata, target);
    return descriptor;
  };
}
