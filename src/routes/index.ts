import type { OpenAPIHono } from '@hono/zod-openapi';
import { registerHelloRoutes } from './hello';
import { registerInfoRoutes } from './info';
import { registerGreetRoutes } from './greet';

/**
 * Register all API routes on the given OpenAPIHono app.
 */
export function registerRoutes(app: OpenAPIHono) {
  registerHelloRoutes(app);
  registerInfoRoutes(app);
  registerGreetRoutes(app);
}
