import { UserType } from '../utils/authUser';

export interface AuthUser {
  id: string;
  role: UserType;
  email: string;
}
