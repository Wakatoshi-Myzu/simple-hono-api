import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

// ────────────────────────────────────────
// Greet Route Definition (OpenAPI)
// ────────────────────────────────────────

const route = createRoute({
  method: 'get',
  path: '/api/greet/{name}',
  summary: 'Personalized Greeting',
  description: 'Returns a personalized greeting based on the provided name',
  tags: ['Greeting'],
  request: {
    params: z.object({
      name: z
        .string()
        .min(1)
        .openapi({
          param: { name: 'name', in: 'path' },
          example: 'Budi',
          description: 'Your name',
        }),
    }),
  },
  responses: {
    200: {
      description: 'Successful greeting response',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'success' }),
            message: z.string().openapi({ example: 'Hello, Budi! Welcome to Hono.js API' }),
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

export function registerGreetRoutes(app: OpenAPIHono) {
  app.openapi(route, (c) => {
    const { name } = c.req.valid('param');
    return c.json({
      status: 'success',
      message: `Hello, ${name}! Welcome to Hono.js API`,
      timestamp: new Date().toISOString(),
    });
  });
}
