import { HandlerMetadata } from "../types";

export function Post(route: any = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: HandlerMetadata = {
      route,
      method: "POST",
      status_response: 201,
      content_type: "application/json",
    };
    Reflect.defineMetadata(propertyKey, metadata, target);
    return descriptor;
  };
}

export function Get(route: any = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const metadata: HandlerMetadata = {
      route,
      method: "GET",
      status_response: 200,
      content_type: "application/json",
    };
    Reflect.defineMetadata(propertyKey, metadata, target);
    return descriptor;
  };
}

export function ContentType(content_type: string) {
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
      content_type,
    };
    Reflect.defineMetadata(propertyKey, metadata, target);
    return descriptor;
  };
}
