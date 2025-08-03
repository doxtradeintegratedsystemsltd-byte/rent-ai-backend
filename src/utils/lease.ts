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
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  return new Date(
    new Date(startDate).getTime() + propertyLeaseYears * leaseCycles * oneYear
  );
};
