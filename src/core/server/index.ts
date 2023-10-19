import { container, InjectionToken, singleton } from "tsyringe";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { Logger } from "../logger";
import { isAddressInfo } from "./utils/isAddressInfo";
import { join } from "path";
import { ExceptionError, isExceptionError } from "../abstract/exception-error";
import { InternalServerErrorException } from "../exceptions/InternalServerErrorException";
import { NotFoundException } from "../exceptions/NotFoundException";
import {
  Handler,
  HandlerMetadata,
  RouteGuard,
  RouteHandler,
  ServerConfig,
} from "../types";
import { isPromise } from "util/types";
import { extractParams } from "./utils/extractParams";
import { extractQuery } from "./utils/extractQuery";
import { BaseGuard } from "../abstract/base-guard";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";

@singleton()
export class AppServer {
  private serverInstance!: Server;
  private config!: ServerConfig;

  private routes: RouteHandler[] = [];
  private guards: RouteGuard[] = [];

  constructor(private readonly appLogger: Logger) {
    console.log("Starting server...");
  }

  startServer = (config: ServerConfig) => {
    this.serverInstance = createServer();

    this.serverInstance.addListener("request", async (req, res) => {
      try {
        await this.routeHandler(req, res);
      } catch (e: any) {
        let exception: ExceptionError;
        if (isExceptionError(e)) {
          exception = e;
        } else {
          this.appLogger.error(e);
          exception = new InternalServerErrorException();
        }

        res.setHeader("Content-Type", "application/json");
        res.statusCode = exception.statusCode;
        res.end(
          JSON.stringify({
            statusCode: exception.statusCode,
            message: exception.message,
          })
        );
      }
    });

    this.serverInstance.listen(config.port, (): void => {
      const address = this.getAddressInfo();
      this.appLogger.info(`Server is running on ${address}`);
    });
  };

  registerRoutes = (routes: InjectionToken[]): void => {
    routes.forEach((token) => {
      const route = Reflect.getMetadata("route", token);
      const instance = container.resolve(token);

      Reflect.getMetadataKeys(instance).forEach((key) => {
        const metadata: HandlerMetadata = Reflect.getMetadata(key, instance);
        const path = join("/", route, metadata.route).replace(/\\/g, "/");

        const module = `[${(token as any).name}]`;
        const registered = `{${metadata.method}, ${path}}`;
        this.appLogger.info(`${module} Registered Endpoint: ${registered}`);

        this.routes.push({
          endpoint: path,
          instance: instance,
          instanceToken: token,
          handlerKey: key,
          method: metadata.method,
        });
      });
    });
  };

  registerGuards = (guards: InjectionToken[]): void => {
    guards.forEach((guard) => {
      const instance = container.resolve<BaseGuard>(guard);
      this.guards.push({ instance });
    });
  };

  executeGuards = async (
    req: IncomingMessage,
    handler: RouteHandler
  ): Promise<void> => {
    const guardResultsRaw = this.guards.map((guard) =>
      guard.instance.execute(req, handler)
    );

    const guardResults: boolean[] = [];
    for (const result of guardResultsRaw) {
      if (isPromise(result)) {
        guardResults.push(await result);
      } else {
        guardResults.push(result);
      }
    }

    if (guardResults.some((result) => !result)) {
      throw new UnauthorizedException();
    }
  };

  private routeHandler = async (
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> => {
    const requestUrl = new URL(req.url!, `http://${req.headers.host}`);
    const pathname = requestUrl.pathname;

    this.appLogger.debug(`Request: {${req.method} ${pathname}}`);

    const routeHandler = this.findRouteHandler(req);

    if (!routeHandler) {
      throw new NotFoundException(`Cannot ${req.method} ${pathname}`);
    }

    await this.executeGuards(req, routeHandler);

    const methodMetadata: HandlerMetadata = Reflect.getMetadata(
      routeHandler.handlerKey,
      routeHandler.instance
    );

    res.setHeader("Content-Type", methodMetadata.content_type);
    res.statusCode = methodMetadata.status_response;

    const data: Handler = {
      req,
      res,
      params: extractParams(routeHandler, pathname),
      query: extractQuery(requestUrl.searchParams),
    };

    let result = routeHandler.instance[routeHandler.handlerKey](data);
    if (isPromise(result)) {
      result = await result;
    }

    this.appLogger.debug(
      `Response: {${routeHandler.method}, ${routeHandler.endpoint}}`
    );

    res.end(result);
  };

  private getAddressInfo = (): string => {
    const addressInfo = this.serverInstance.address();
    if (isAddressInfo(addressInfo)) {
      const hostname =
        addressInfo.address == "::" ? "localhost" : addressInfo.address;
      return `http://${hostname}:${addressInfo.port}`;
    }
    return addressInfo ?? "";
  };

  private findRouteHandler = (req: IncomingMessage) => {
    const requestUrl = new URL(req.url!, this.getAddressInfo());
    const pathname = requestUrl.pathname;
    const pathSplit = pathname.split("/").filter((p) => p);

    const filteredByMethod = this.routes.filter(
      ({ method }) => method == req.method
    );

    return filteredByMethod.find(({ endpoint }) => {
      const endpointParts = endpoint.split("/").filter((p) => p);

      if (endpointParts.length != pathSplit.length) {
        return false;
      }

      return endpointParts.every((routeName, i) =>
        routeName.includes(":") ? true : routeName == pathSplit[i]
      );
    });
  };
}
