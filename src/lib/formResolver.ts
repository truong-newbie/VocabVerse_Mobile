/**
 * @hookform/resolvers + zod bridge. Centralized so screens import
 * from one place and we can swap validator libs later.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

export function formResolver<T extends ZodTypeAny>(schema: T): Resolver<unknown> {
  return zodResolver(schema) as Resolver<unknown>;
}

export { z } from 'zod';
