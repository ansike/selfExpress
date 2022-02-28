import { IncomingMessage, ServerResponse } from "http";
import { RouteMethodType, HandleFnType, NextFnType } from "../interface";
import { getBasicNodeMethods } from "../constant";
import Layer from "./Layer";
interface Route {
  [key: string]: Function | any;
  path: string;
  stack: Layer[];
  methods: RouteMethodType;
}
class Route {
  constructor(path: string) {
    this.path = path;
    this.stack = [];
    this.methods = {};
  }
  isMatchMethod(method: string) {
    const name = method.toLowerCase();
    return Boolean(this.methods[name]);
  }

  dispatch(req: IncomingMessage, res: ServerResponse, done: NextFnType) {
    const method = req.method?.toLowerCase();
    const stack = this.stack;
    const len = this.stack.length;
    let idx = 0;
    function next(err?: any) {
      //跳过route
      if (err && err === "route") {
        return done();
      }

      //跳过整个路由系统
      if (err && err === "router") {
        return done(err);
      }
      //越界
      if (idx >= len) {
        return done(err);
      }

      const layer = stack[idx++];
      if (method !== layer.method) {
        next(err);
      }

      if (err) {
        return done(err);
      } else {
        layer.handle_request(req, res, next);
      }
    }

    next();
    // for (let i = 0; i < len; i++) {
    //   const layer = this.stack[i];
    //   if (this.methods[method!] && method === layer.method) {
    //     return layer.handle_request(req, res);
    //   }
    // }
  }
}

getBasicNodeMethods().forEach((method: string) => {
  Route.prototype[method] = function (fn: HandleFnType) {
    const layer = new Layer("/", fn);
    layer.method = method;
    this.methods[method] = true;
    this.stack.push(layer);
    return this;
  };
});

export default Route;
