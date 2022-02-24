import { IncomingMessage, ServerResponse } from "http";
import { RouteType, HandleFnType } from "./interface";

class Router {
  stack: RouteType[] = [
    {
      path: "*",
      method: "*",
      handle: function (req, res) {
        res.writeHead(200, {
          "Content-Type": "text/plain",
        });
        res.end("404");
      },
    },
  ];
  constructor() {}
  get(path: string, handle: HandleFnType) {
    this.stack.push({
      path,
      method: "GET",
      handle,
    });
  }

  handle(req: IncomingMessage, res: ServerResponse) {
    const len = this.stack.length;
    for (let i = 1; i < len; i++) {
      const { path, method, handle } = this.stack[i];
      if (
        (path === "*" || path === req.url) &&
        (method === "*" || method === req.method)
      ) {
        return handle && handle(req, res);
      }
    }
    return this.stack[0].handle(req, res);
  }
}

export default Router;
