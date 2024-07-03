var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-cVDOAO/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-cVDOAO/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/index.js
var require_src = __commonJS({
  "src/index.js"() {
    init_checked_fetch();
    init_modules_watch_stub();
    var EMAIL_VALIDATION_API = "https://api.leadmagic.io/email-validate";
    var API_KEY = "NrAsFMLwnNegbfZmUKco5EHJG5FK2Xim";
    addEventListener("fetch", (event) => {
      event.respondWith(handleRequest(event.request));
    });
    async function handleRequest(request) {
      const { pathname } = new URL(request.url);
      if (pathname === "/") {
        return new Response(`
      <h1>Email Validator</h1>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file"><br><br>
        <input type="submit">
      </form>
    `, { headers: { "Content-Type": "text/html" } });
      } else if (pathname === "/upload" && request.method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || file.size === 0) {
          return new Response("No selected file", { status: 400 });
        }
        try {
          const csvContent = await file.text();
          const { headers, rows } = parseCSV(csvContent);
          const emailColumnIndex = headers.findIndex((header) => header.toLowerCase().includes("email"));
          if (emailColumnIndex === -1) {
            return new Response("Email column not found", { status: 400 });
          }
          const emails = rows.map((row) => row[emailColumnIndex]).filter((email) => email);
          const emailStatuses = await validateEmails(emails);
          const csv = emailStatuses.map((status) => `${status.email},${status.status}`).join("\n");
          const resultBlob2 = new Blob([csv], { type: "text/csv" });
          return new Response(`
        <h1>Email Validator</h1>
        <p>Validation complete. <a href="/download">Download the validated emails CSV</a></p>
      `, { headers: { "Content-Type": "text/html" } });
        } catch (error) {
          console.error("Error processing file:", error);
          return new Response("Error processing file", { status: 500 });
        }
      } else if (pathname === "/download") {
        return new Response(resultBlob, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="validated_emails.csv"'
          }
        });
      } else {
        return new Response("Not Found", { status: 404 });
      }
    }
    function parseCSV(csvContent) {
      const lines = csvContent.trim().split("\n");
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map((line) => line.split(","));
      return { headers, rows };
    }
    async function validateEmails(emails) {
      const emailStatuses = [];
      for (const email of emails) {
        try {
          const response = await fetch(EMAIL_VALIDATION_API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY
            },
            body: JSON.stringify({ email })
          });
          const result = await response.json();
          emailStatuses.push({ email, status: result.email_status || "unknown" });
        } catch (error) {
          emailStatuses.push({ email, status: "error" });
        }
      }
      return emailStatuses;
    }
  }
});

// .wrangler/tmp/bundle-cVDOAO/middleware-loader.entry.ts
var middleware_loader_entry_exports = {};
__export(middleware_loader_entry_exports, {
  __INTERNAL_WRANGLER_MIDDLEWARE__: () => __INTERNAL_WRANGLER_MIDDLEWARE__,
  default: () => middleware_loader_entry_default
});
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-cVDOAO/middleware-insertion-facade.js
var middleware_insertion_facade_exports = {};
__export(middleware_insertion_facade_exports, {
  __INTERNAL_WRANGLER_MIDDLEWARE__: () => __INTERNAL_WRANGLER_MIDDLEWARE__,
  default: () => middleware_insertion_facade_default
});
init_checked_fetch();
init_modules_watch_stub();
var OTHER_EXPORTS = __toESM(require_src());

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
};
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
var jsonError = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
};
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-cVDOAO/middleware-insertion-facade.js
__reExport(middleware_insertion_facade_exports, __toESM(require_src()));
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  ...void 0 ?? [],
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = OTHER_EXPORTS.default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}

// .wrangler/tmp/bundle-cVDOAO/middleware-loader.entry.ts
__reExport(middleware_loader_entry_exports, middleware_insertion_facade_exports);
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker2) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker2;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = function(request, env, ctx) {
    if (worker2.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker2.fetch(request, env, ctx);
  };
  return {
    ...worker2,
    fetch(request, env, ctx) {
      const dispatcher = function(type, init) {
        if (type === "scheduled" && worker2.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker2.scheduled(controller, env, ctx);
        }
      };
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
