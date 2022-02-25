import { IncomingMessage, ServerResponse } from "http";
import { RouteType, HandleFnType } from "../interface";
import Layer from "./Layer";
import Route from "./Route";

class Router {
  stack: Layer[] = [
    new Layer(
      "*",
      // method: "*",
      function handle(req, res) {
        res.writeHead(200, {
          "Content-Type": "text/plain",
        });
        res.end("404");
      }
    ),
  ];
  constructor() {}

  get(path: string, handle: HandleFnType) {
    const route = this.route(path);
    route.get(handle);
    return this;
  }

  handle(req: IncomingMessage, res: ServerResponse) {
    const len = this.stack.length;
    for (let i = 1; i < len; i++) {
      const layer = this.stack[i];
      if (layer.isMatch(req.url || "")) {
        return layer.handle_request(req, res);
      }
    }
    return this.stack[0].handle_request(req, res);
  }

  route(path: string) {
    const route = new Route(path);
    const layer = new Layer(path, (req, res) => {
      route.dispatch(req, res);
    });
    layer.route = route;
    this.stack.push(layer);
    return route;
  }
}

export default Router;
