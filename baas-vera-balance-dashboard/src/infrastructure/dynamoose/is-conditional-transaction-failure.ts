export function isConditionalTransactionFailure(error: unknown): boolean {
  if (!(error instanceof Error) || error.name !== 'TransactionCanceledException') return false;
  const reasons = (error as Error & {
    CancellationReasons?: Array<{ Code?: string }>;
  }).CancellationReasons;
  return Array.isArray(reasons)
    && reasons.some(reason => reason.Code === 'ConditionalCheckFailed')
    && reasons.every(reason => !reason.Code || ['None', 'ConditionalCheckFailed'].includes(reason.Code));
}
