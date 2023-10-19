import { join } from "path";

export function RouteEndpoint(route?: string) {
  return function (target: any) {
    Reflect.defineMetadata("route", join(route ?? ""), target);
  };
}
