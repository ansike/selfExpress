import { IncomingMessage, ServerResponse } from "http";
import { RouteMethodType, HandleFnType } from "../interface";
import Layer from "./Layer";
class Route {
  path: string;
  stack: Layer[] = [];
  methods: RouteMethodType = {};
  constructor(path: string) {
    this.path = path;
    this.stack = [];
    this.methods = {};
  }
  _handle_method(method: string) {
    const name = method.toLowerCase();
    return Boolean(this.methods[name]);
  }
  get(fn: HandleFnType) {
    const layer = new Layer("/", fn);
    layer.method = "get";
    this.methods["get"] = true;
    this.stack.push(layer);
    return this;
  }
  dispatch(req: IncomingMessage, res: ServerResponse) {
    const method = req.method?.toLowerCase();
    const len = this.stack.length;
    for (let i = 0; i < len; i++) {
      const layer = this.stack[i];
      if (this.methods[method!] && method === layer.method) {
        return layer.handle_request(req, res);
      }
    }
  }
}

export default Route;
