import { generateId } from './id';

export function generateCorrelationId(): string {
  return `req-${generateId().slice(0, 8)}`;
}
