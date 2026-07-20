import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

// ────────────────────────────────────────
// Info Route Definition (OpenAPI)
// ────────────────────────────────────────

const route = createRoute({
  method: 'get',
  path: '/api/info',
  summary: 'API Information',
  description: 'Returns API information and a list of all available endpoints',
  tags: ['Info'],
  responses: {
    200: {
      description: 'Successful info response',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string().openapi({ example: 'success' }),
            data: z.object({
              name: z.string().openapi({ example: 'Myzu First Hono API' }),
              version: z.string().openapi({ example: '1.0.0' }),
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

// ────────────────────────────────────────
// Registration
// ────────────────────────────────────────

export function registerInfoRoutes(app: OpenAPIHono) {
  app.openapi(route, (c) => {
    return c.json({
      status: 'success',
      data: {
        name: 'Myzu First Hono API',
        version: '1.0.0',
        description: 'A simple Hono.js Hello World API',
        endpoints: [
          { path: '/api/hello', method: 'GET', description: 'Returns a hello world message' },
          { path: '/api/info', method: 'GET', description: 'Returns API information' },
          { path: '/api/greet/:name', method: 'GET', description: 'Returns a personalized greeting' },
        ],
      },
    });
  });
}
