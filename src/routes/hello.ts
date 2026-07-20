import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

// ────────────────────────────────────────
// Hello Route Definition (OpenAPI)
// ────────────────────────────────────────

const route = createRoute({
  method: 'get',
  path: '/api/hello',
  summary: 'Hello World',
  description: 'Returns a simple hello world message with timestamp',
  tags: ['Greeting'],
  responses: {
    200: {
      description: 'Successful hello response',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'success' }),
            message: z.string().openapi({ example: 'Hello World!' }),
            timestamp: z.string().openapi({ example: '2026-01-01T00:00:00.000Z' }),
          }),
        },
      },
    },
  },
});

// ────────────────────────────────────────
// Registration
// ────────────────────────────────────────

export function registerHelloRoutes(app: OpenAPIHono) {
  app.openapi(route, (c) => {
    return c.json({
      status: 'success',
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
    });
  });
}
