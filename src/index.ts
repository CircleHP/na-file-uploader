import "reflect-metadata";
import { container } from "tsyringe";
import { AppServer } from "./core/server";
import { PORT } from "./common/env";
import { RootRoute } from "./routes/root/root.route";
import { AppGuard } from "./guards/app.guard";

const app = container.resolve(AppServer);

app.registerGuards([AppGuard]);
app.registerRoutes([RootRoute]);

app.startServer({
  port: +PORT!,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, private",
  },
});
