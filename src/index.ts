import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';

import { registerRoutes } from './routes';
import { setupDocs } from './docs';

// ===========================================================================
// App Initialization
// ===========================================================================

const app = new OpenAPIHono();

app.use('/*', cors());

// ===========================================================================
// Register API Routes
// ===========================================================================

registerRoutes(app);

// ===========================================================================
// Setup API Documentation (OpenAPI Spec + Swagger UI)
// ===========================================================================

setupDocs(app);

// ===========================================================================
// Static Files & Fallback
// ===========================================================================

// Serve static files from the public directory
app.use(
  '/*',
  serveStatic({
    root: './public',
  }),
);

// Fallback 404 handler for unmatched API routes
app.notFound((c) => {
  return c.json(
    {
      status: 'error',
      message: 'Route not found',
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

process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // kill command
