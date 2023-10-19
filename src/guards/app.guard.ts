import { injectable } from "tsyringe";
import { IncomingMessage } from "http";
import { BaseGuard } from "../core/abstract/base-guard";
import { API_KEY } from "../common/env";

@injectable()
export class AppGuard extends BaseGuard {
  constructor() {
    super(AppGuard.name);
  }

  async validate(req: IncomingMessage): Promise<boolean> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !(authHeader.includes("Token") || authHeader.includes('Bearer'))) {
      return false;
    }

    return authHeader.split(" ")[1] == API_KEY;
  }
}
