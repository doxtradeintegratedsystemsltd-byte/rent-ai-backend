export enum JobStatus {
  pending = 'pending',
  running = 'running',
  completed = 'completed',
  cancelled = 'cancelled',
  failed = 'failed',
}

export enum JobNames {
  rentDue = 'rentDue',
}

export type JobObject = {
  [JobNames.rentDue]: {
    leaseId: string;
    timestamp: string;
    type: 'twoMonthsBefore' | 'twoWeeksBefore' | 'due';
  };
};
