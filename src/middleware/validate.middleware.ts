import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Generic request validator. Pass a Zod schema shaped like:
 *   z.object({ body: z.object({...}), params: z.object({...}), query: z.object({...}) })
 * Only include the keys you actually want validated.
 * On failure, the ZodError is forwarded to the global error handler,
 * which formats it into the standard { success, message, errorDetails } shape.
 */
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;

      next();
    } catch (err) {
      next(err);
    }
  };
}
