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

export function timestampToCron(timestamp: Date): string {
  const date = new Date(timestamp);
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // Months are 0-based
  // const year = date.getUTCFullYear();

  // Return a cron expression that matches the exact timestamp
  return `${minute} ${hour} ${day} ${month} *`;
}
