
import { z } from 'zod';
import { AppError } from '../../errors/app.error.js';
import type { UpdateViewsInput } from './payout.types.js';

const updateViewsSchema = z.strictObject({
  views: z.number().int().nonnegative().refine(Number.isSafeInteger, {
    message: 'Views must be a safe integer',
  }),
});

export function validateUpdateViews(body: unknown): UpdateViewsInput {
  const result = updateViewsSchema.safeParse(body);

  if (!result.success) {
    throw new AppError(
      result.error.issues[0]?.message ?? 'Invalid views update',
      400
    );
  }

  return result.data;
}
