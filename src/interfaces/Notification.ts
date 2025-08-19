import { User } from '../entities/User';
import { NotificationType } from '../utils/notification';
import { UserType } from '../utils/authUser';
import { Tenant } from '../entities/Tenant';
import { Lease } from '../entities/Lease';
import { Property } from '../entities/Property';

export interface NotificationTrigger {
  userType: UserType;
  tenant?: Tenant;
  admin?: User;
  lease?: Lease;
  property?: Property;
  notificationType: NotificationType;
  userId?: string;
}
