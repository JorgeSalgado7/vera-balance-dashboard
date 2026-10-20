// Identifies a transaction without exposing its persistence implementation.
export interface TransactionContext {
  readonly transactionId: symbol;
}
