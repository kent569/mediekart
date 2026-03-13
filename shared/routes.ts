import { z } from 'zod';
import { 
  insertCompanySchema, 
  insertOfficeSchema, 
  insertRelationshipSchema,
  companies,
  offices,
  relationships,
  countries
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  map: {
    data: {
      method: 'GET' as const,
      path: '/api/map/data',
      responses: {
        200: z.object({
          countries: z.array(z.custom<typeof countries.$inferSelect>()),
          companies: z.array(z.custom<typeof companies.$inferSelect>()),
          offices: z.array(z.custom<typeof offices.$inferSelect>()),
          relationships: z.array(z.custom<typeof relationships.$inferSelect>()),
        }),
      },
    },
  },
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies',
      input: z.object({
        search: z.string().optional(),
        industry: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/companies/:id',
      responses: {
        200: z.custom<any>(), // Typed as CompanyWithDetails in implementation
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
