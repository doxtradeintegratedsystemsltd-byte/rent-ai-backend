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

export enum LeaseStatus {
  ACTIVE = 'active',
  INACTIVE = 'in-active',
}

export const getLeaseEndDate = (
  startDate: Date | string,
  noOfYears: number
) => {
  return new Date(
    new Date(startDate).getTime() + noOfYears * 365 * 24 * 60 * 60 * 1000
  );
};
