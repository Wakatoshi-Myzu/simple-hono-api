import type { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

/**
 * Set up OpenAPI JSON spec endpoint and Swagger UI on the given app.
 */
export function setupDocs(app: OpenAPIHono) {
  // ── OpenAPI JSON Specification ────────────────
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      title: 'Myzu First Hono API',
      version: '1.0.0',
      description:
        'A simple Hello World API built with **Hono.js** and **TypeScript**. ' +
        'This API demonstrates basic CRUD-like endpoints with full OpenAPI documentation.',
      contact: {
        name: 'Myzu Project',
        url: 'https://github.com/myzu-project',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Greeting', description: 'Greeting-related endpoints' },
      { name: 'Info', description: 'API information endpoints' },
    ],
  });

  // ── Swagger UI ────────────────────────────────
  app.get('/api/docs', swaggerUI({ url: '/doc', title: 'Myzu API - Swagger Documentation' }));
}
