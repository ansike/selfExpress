import http, { IncomingMessage, ServerResponse } from "http";
import { RouteType, HandleFnType } from "./interface";
import Router from "./Router/Router";
import { getBasicNodeMethods } from "./constant";
// import https from "https";

interface SelfExpress {
  [key: string]: Function | any;
}
class SelfExpress {
  _router = new Router();
  server: null | http.Server = null;
  route: {
    all: RouteType[];
  } = {
    all: [],
  };
  constructor() {}

  use(path: string = "/", handle: HandleFnType) {
    if (!handle) {
      throw new Error("middleware 初始化handle不存在");
    }
    this._router.use(path, handle);
    return this;
  }

  handle(req: IncomingMessage, res: ServerResponse) {
    const done = function (err: any) {
      res.writeHead(200, {
        "Content-Type": "text/plain",
      });
      if (err) {
        res.end("404: " + err);
      } else {
        var msg = "Cannot " + req.method + " " + req.url;
        res.end(msg);
      }
    };
    return this._router.handle(req, res, done);
  }

  listen(port: number, cb: (() => void) | undefined) {
    this.server = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        this.handle(req, res);
      }
    );
    this.server?.listen.call(this.server, port, cb);
    console.log("server start. listen port:", port);
  }
}

getBasicNodeMethods().forEach((method) => {
  SelfExpress.prototype[method] = function (
    path: string,
    handle: HandleFnType
  ) {
    this._router[method].call(this._router, path, handle);
    return this;
  };
});

export default SelfExpress;
