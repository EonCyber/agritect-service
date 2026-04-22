export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};
