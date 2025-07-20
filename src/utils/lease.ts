export enum RentStatus {
  PAID = 'paid',
  OVER_DUE = 'overDue',
  NEAR_DUE = 'nearDue',
  DUE = 'due',
}

export enum PaymentType {
  MANUAL = 'manual',
  PAYSTACK = 'paystack',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
