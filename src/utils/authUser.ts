export enum UserType {
  TENANT = 'tenant',
  ADMIN = 'admin',
  SUPER_ADMIN = 'superAdmin',
}

export const RoleGroups = {
  allAdmins: [UserType.ADMIN, UserType.SUPER_ADMIN],
  superAdmin: [UserType.SUPER_ADMIN],
  tenant: [UserType.TENANT],
};
