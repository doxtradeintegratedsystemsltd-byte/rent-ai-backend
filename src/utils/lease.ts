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
  propertyLeaseYears: number,
  leaseCycles: number
) => {
  // const oneYear = 365 * 24 * 60 * 60 * 1000;
  // for testing one year will be one day
  const oneYear = 24 * 60 * 60 * 1000;

  return new Date(
    new Date(startDate).getTime() + propertyLeaseYears * leaseCycles * oneYear
  );
};

export const PAYSTACK_PAYMENT_LIMIT = 1000 * 1000; // 1 million naira
