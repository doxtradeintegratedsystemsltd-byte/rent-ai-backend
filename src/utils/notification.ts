export enum NotificationStatus {
  PENDING = 'pending',
  // READ = 'read',
}

export enum NotificationType {
  TENANT_ASSIGNED = 'tenant_assigned',
  TENANT_REMOVED = 'tenant_removed',
  RENT_NEAR_DUE = 'rent_near_due',
  RENT_DUE = 'rent_due',
  RENT_PAID = 'rent_paid',
  RENT_OVERDUE = 'rent_overdue',
  PROPERTY_CREATED = 'property_created',
}

export enum NotificationChannel {
  INTERNAL = 'internal',
  EMAIL = 'email',
  SMS = 'sms',
}
