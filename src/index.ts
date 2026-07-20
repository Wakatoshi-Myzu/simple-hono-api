import { serve } from "@hono/node-server";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";

const app = new OpenAPIHono();

app.use("/*", cors());

const helloRoute = createRoute({
  method: "get",
  path: "/api/hello",
  summary: "Hello World",
  description: "Returns a simple hello world message with timestamp",
  tags: ["Greeting"],
  responses: {
    200: {
      description: "Successful hello response",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "success" }),
            message: z.string().openapi({ example: "Hello World!" }),
            timestamp: z.string().openapi({ example: "2026-01-01T00:00:00.000Z" }),
          }),
        },
      },
    },
  },
});

app.openapi(helloRoute, (c) => {
  return c.json({
    status: "success",
    message: "Hello World!",
    timestamp: new Date().toISOString(),
  });
});

const infoRoute = createRoute({
  method: "get",
  path: "/api/info",
  summary: "API Information",
  description: "Returns API information and a list of all available endpoints",
  tags: ["Info"],
  responses: {
    200: {
      description: "Successful info response",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "success" }),
            data: z.object({
              name: z.string().openapi({ example: "Myzu First Hono API" }),
              version: z.string().openapi({ example: "1.0.0" }),
              description: z.string(),
              endpoints: z.array(
                z.object({
                  path: z.string(),
                  method: z.string(),
                  description: z.string(),
                }),
              ),
            }),
          }),
        },
      },
    },
  },
});

app.openapi(infoRoute, (c) => {
  return c.json({
    status: "success",
    data: {
      name: "Myzu First Hono API",
      version: "1.0.0",
      description: "A simple Hono.js Hello World API",
      endpoints: [
        { path: "/api/hello", method: "GET", description: "Returns a hello world message" },
        { path: "/api/info", method: "GET", description: "Returns API information" },
        { path: "/api/greet/:name", method: "GET", description: "Returns a personalized greeting" },
      ],
    },
  });
});

const greetRoute = createRoute({
  method: "get",
  path: "/api/greet/{name}",
  summary: "Personalized Greeting",
  description: "Returns a personalized greeting based on the provided name",
  tags: ["Greeting"],
  request: {
    params: z.object({
      name: z
        .string()
        .min(1)
        .openapi({
          param: { name: "name", in: "path" },
          example: "Budi",
          description: "Your name",
        }),
    }),
  },
  responses: {
    200: {
      description: "Successful greeting response",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string().openapi({ example: "success" }),
            message: z.string().openapi({ example: "Hello, Budi! Welcome to Hono.js API" }),
            timestamp: z.string().openapi({ example: "2026-01-01T00:00:00.000Z" }),
          }),
        },
      },
    },
  },
});

app.openapi(greetRoute, (c) => {
  const { name } = c.req.valid("param");
  return c.json({
    status: "success",
    message: `Hello, ${name}! Welcome to Hono.js API`,
    timestamp: new Date().toISOString(),
  });
});

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Myzu First Hono API",
    version: "1.0.0",
    description:
      "A simple Hello World API built with **Hono.js** and **TypeScript**. " +
      "This API demonstrates basic CRUD-like endpoints with full OpenAPI documentation.",
    contact: {
      name: "Myzu Project",
      url: "https://github.com/myzu-project",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  tags: [
    { name: "Greeting", description: "Greeting-related endpoints" },
    { name: "Info", description: "API information endpoints" },
  ],
});

// Serve default Swagger UI at /api/docs with minimal improvements
app.get("/api/docs", swaggerUI({ url: "/doc", title: "Myzu API - Swagger Documentation" }));

// ===========================================================================
// Static Files & Fallback
// ===========================================================================

// Serve static files from the public directory
app.use(
  "/*",
  serveStatic({
    root: "./public",
  }),
);

// Fallback 404 handler for unmatched API routes
app.notFound((c) => {
  return c.json(
    {
      status: "error",
      message: "Route not found",
    },
    404,
  );
});

// ===========================================================================
// Server Startup
// ===========================================================================

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`
╔══════════════════════════════════════════════╗
║        🚀 Myzu First Hono Server            ║
╠══════════════════════════════════════════════╣
║                                              ║
║   ● Server running on:                       ║
║     ➜  http://localhost:${port}                    ║
║                                              ║
║   ● API Endpoints:                           ║
║     ➜  GET  /api/hello                      ║
║     ➜  GET  /api/info                       ║
║     ➜  GET  /api/greet/:name                ║
║                                              ║
║   ● 📖 Swagger Documentation:               ║
║     ➜  http://localhost:${port}/api/docs          ║
║     ➜  http://localhost:${port}/doc                ║
║                                              ║
╚══════════════════════════════════════════════╝
`);

const server = serve({
  fetch: app.fetch,
  port,
});

// ===========================================================================
// Graceful Shutdown — Handle Ctrl+C (SIGINT) & other termination signals
// ===========================================================================

let isShuttingDown = false;

function gracefulShutdown(signal: string) {
  if (isShuttingDown) return; // Prevent double invocation
  isShuttingDown = true;

  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║   🛑  Received ${signal}                      ║`);
  console.log(`║        👋 Server shut down cleanly          ║`);
  console.log(`╚══════════════════════════════════════════════╝`);
  console.log(`   Goodbye! See you later. ✨\n`);

  // Best-effort close, then exit immediately.
  // We don't wait for the callback because tsx watch has a 5s
  // watchdog and will force-kill if we don't exit fast enough.
  server.close();
  process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Ctrl+C
process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // kill command
