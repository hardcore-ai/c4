import { OPENAI_CONFIG } from '@/shared/constants';
import { logger } from '@/infrastructure/logging/logger';

type AsyncFn<T> = () => Promise<T>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('rate limit') || message.includes('429')) return true;
    if (message.includes('500') || message.includes('502') || message.includes('503')) return true;
    if (message.includes('timeout') || message.includes('econnreset')) return true;
  }
  return false;
}

export interface ResilientResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export async function withRetry<T>(
  fn: AsyncFn<T>,
  correlationId?: string,
): Promise<ResilientResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (firstError) {
    const error = firstError instanceof Error ? firstError : new Error(String(firstError));

    if (!isRetryableError(error)) {
      logger.error('openai', 'Non-retryable error', {
        correlationId,
        error,
        context: { attempt: 1 },
      });
      return { success: false, error };
    }

    logger.warn('openai', 'Retrying after error', {
      correlationId,
      context: { attempt: 1, error: error.message, retryDelay: OPENAI_CONFIG.RETRY_DELAY_MS },
    });

    await sleep(OPENAI_CONFIG.RETRY_DELAY_MS);

    try {
      const data = await fn();
      logger.info('openai', 'Retry succeeded', {
        correlationId,
        context: { attempt: 2 },
      });
      return { success: true, data };
    } catch (retryError) {
      const retryErr = retryError instanceof Error ? retryError : new Error(String(retryError));
      logger.error('openai', 'Retry failed — pausing conversation', {
        correlationId,
        error: retryErr,
        context: { attempt: 2 },
      });
      return { success: false, error: retryErr };
    }
  }
}
