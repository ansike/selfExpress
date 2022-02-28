import { IncomingMessage, ServerResponse } from "http";
import { HandleFnType, NextFnType } from "../interface";
import Layer from "./Layer";
import Route from "./Route";
import { getBasicNodeMethods } from "../constant";
interface Router {
  [key: string]: Function | any;
  stack: Layer[];
}
class Router {
  constructor() {
    this.stack = [];
  }

  handle(req: IncomingMessage, res: ServerResponse, done: NextFnType) {
    const self = this,
      method = req.method,
      stack = self.stack;
    let idx = 0;

    function next(err?: any) {
      const layerError = err === "route" ? null : err;

      //跳过路由系统
      if (layerError === "router") {
        return done(null);
      }

      if (idx >= stack.length || layerError) {
        return done(layerError);
      }

      const layer = stack[idx++];
      //匹配，执行

      if (layer.isMatchedUrl(req.url!)) {
        if (!layer.route) {
          return layer.handle_request(req, res, next);
        } else if (layer.route.isMatchMethod(method!)) {
          return layer.handle_request(req, res, next);
        }
      } else {
        next(layerError);
      }
    }

    next();
  }

  use(path: string, handle: HandleFnType) {
    const layer = new Layer(path, handle);
    layer.route = undefined;
    this.stack.push(layer);
    return this;
  }

  route(path: string) {
    const route = new Route(path);
    const layer = new Layer(path, route.dispatch.bind(route));
    layer.route = route;
    this.stack.push(layer);
    return route;
  }
}

getBasicNodeMethods().forEach((method) => {
  Router.prototype[method] = function (path: string, handle: HandleFnType) {
    const route = this.route(path);
    route[method].call(route, handle);
    return this;
  };
});

export default Router;
