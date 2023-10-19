import { IncomingMessage, ServerResponse } from "http";
import { BaseGuard } from "../abstract/base-guard";
import { InjectionToken } from "tsyringe";

export interface HandlerMetadata {
  route: string;
  method: string;
  status_response: number;
  content_type: string;
  guard_token?: string;
}

export interface Handler {
  req: IncomingMessage;
  set res(value: ServerResponse);
  get res(): Omit<ServerResponse, "end">;
  params: Record<string, string>;
  query: Record<string, string>;
}

export type HandlerResponse = Buffer | Uint8Array | string;

export interface ServerConfig {
  port: number;
  headers?: Record<string, string>;
}

export interface RouteHandler {
  endpoint: string;
  method: string;
  instance: any;
  instanceToken: InjectionToken;
  handlerKey: string;
}

export interface RouteGuard {
  instance: BaseGuard;
}
