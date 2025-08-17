import { User } from '../entities/User';
import { NotificationType } from '../utils/notification';
import { UserType } from '../utils/authUser';
import { Tenant } from '../entities/Tenant';

export interface NotificationTrigger {
  userType: UserType;
  tenant?: Tenant;
  admin?: User;
  notificationType: NotificationType;
  userId?: string;
}
