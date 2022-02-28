import { IncomingMessage, ServerResponse } from "http";
import { HandleFnType, NextFnType } from "../interface";
import Route from "./Route";

class Layer {
  name: string;
  path: string;
  method?: string;
  handle: HandleFnType;
  route?: Route;
  constructor(path: string, fn: HandleFnType) {
    this.name = fn.name || "<anonymous>";
    this.path = path;
    this.handle = fn;
  }
  handle_request(req: IncomingMessage, res: ServerResponse, next: NextFnType) {
    const fn = this.handle;
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  }
  isMatchedUrl(path: string) {
    if (path === "*" || path === this.path) {
      return true;
    }
    return false;
  }
}

export default Layer;
