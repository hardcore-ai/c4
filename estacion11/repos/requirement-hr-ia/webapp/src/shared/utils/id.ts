import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function generateEventId(): string {
  const timestamp = new Date().toISOString();
  return `${timestamp}#${uuidv4()}`;
}
