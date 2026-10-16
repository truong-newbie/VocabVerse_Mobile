// Compatibility shim during the api/ migration. New code should import from
// '@/api' or '@/api/<service>'. This file is removed at the end of Phase 1.
export { api, extractApiError, storage } from '@/api';
export * from '@/services/api';
