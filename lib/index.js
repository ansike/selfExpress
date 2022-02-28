'use strict';

var http = require('http');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);

class Layer {
    constructor(path, fn) {
        this.name = fn.name || "<anonymous>";
        this.path = path;
        this.handle = fn;
    }
    handle_request(req, res, next) {
        const fn = this.handle;
        try {
            fn(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    isMatchedUrl(path) {
        if (path === "*" || path === this.path) {
            return true;
        }
        return false;
    }
}

function getBasicNodeMethods() {
    return [
        'get',
        'post',
        'put',
        'head',
        'delete',
        'options',
        'trace',
        'copy',
        'lock',
        'mkcol',
        'move',
        'purge',
        'propfind',
        'proppatch',
        'unlock',
        'report',
        'mkactivity',
        'checkout',
        'merge',
        'm-search',
        'notify',
        'subscribe',
        'unsubscribe',
        'patch',
        'search',
        'connect'
    ];
}

class Route {
    constructor(path) {
        this.path = path;
        this.stack = [];
        this.methods = {};
    }
    isMatchMethod(method) {
        const name = method.toLowerCase();
        return Boolean(this.methods[name]);
    }
    dispatch(req, res, done) {
        var _a;
        const method = (_a = req.method) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const stack = this.stack;
        const len = this.stack.length;
        let idx = 0;
        function next(err) {
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
            }
            else {
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
getBasicNodeMethods().forEach((method) => {
    Route.prototype[method] = function (fn) {
        const layer = new Layer("/", fn);
        layer.method = method;
        this.methods[method] = true;
        this.stack.push(layer);
        return this;
    };
});

class Router {
    constructor() {
        this.stack = [];
    }
    handle(req, res, done) {
        const self = this, method = req.method, stack = self.stack;
        let idx = 0;
        function next(err) {
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
            if (layer.isMatchedUrl(req.url)) {
                if (!layer.route) {
                    return layer.handle_request(req, res, next);
                }
                else if (layer.route.isMatchMethod(method)) {
                    return layer.handle_request(req, res, next);
                }
            }
            else {
                next(layerError);
            }
        }
        next();
    }
    use(path, handle) {
        const layer = new Layer(path, handle);
        layer.route = undefined;
        this.stack.push(layer);
        return this;
    }
    route(path) {
        const route = new Route(path);
        const layer = new Layer(path, route.dispatch.bind(route));
        layer.route = route;
        this.stack.push(layer);
        return route;
    }
}
getBasicNodeMethods().forEach((method) => {
    Router.prototype[method] = function (path, handle) {
        const route = this.route(path);
        route[method].call(route, handle);
        return this;
    };
});

class SelfExpress {
    constructor() {
        this._router = new Router();
        this.server = null;
        this.route = {
            all: [],
        };
    }
    use(path = "/", handle) {
        if (!handle) {
            throw new Error("middleware 初始化handle不存在");
        }
        this._router.use(path, handle);
        return this;
    }
    handle(req, res) {
        const done = function (err) {
            res.writeHead(200, {
                "Content-Type": "text/plain",
            });
            if (err) {
                res.end("404: " + err);
            }
            else {
                var msg = "Cannot " + req.method + " " + req.url;
                res.end(msg);
            }
        };
        return this._router.handle(req, res, done);
    }
    listen(port, cb) {
        var _a;
        this.server = http__default["default"].createServer((req, res) => {
            this.handle(req, res);
        });
        (_a = this.server) === null || _a === void 0 ? void 0 : _a.listen.call(this.server, port, cb);
        console.log("server start. listen port:", port);
    }
}
getBasicNodeMethods().forEach((method) => {
    SelfExpress.prototype[method] = function (path, handle) {
        this._router[method].call(this._router, path, handle);
        return this;
    };
});

module.exports = SelfExpress;
