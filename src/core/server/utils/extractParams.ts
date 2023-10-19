import { RouteHandler } from "../../types";

export const extractParams = (
  routeHandler: RouteHandler,
  requestPathname: string
): Record<string, string> => {
  const pathSplit = requestPathname.split("/").filter((p) => p);

  return routeHandler.endpoint
    .split("/")
    .filter((p) => p)
    .reduce((acc, routeName, i) => {
      if (routeName.includes(":")) {
        acc[routeName.substring(1)] = pathSplit[i];
      }
      return acc;
    }, {} as Record<string, string>);
};
