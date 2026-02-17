import http from "node:http";

import { routeHandler } from "./middlewares/routeHandler.js";
import { jsonHandler } from "./middlewares/jsonHandler.js";

async function listener(req, res) {
  await jsonHandler(req, res);

  routeHandler(req, res);
}

http.createServer(listener).listen(3333);
