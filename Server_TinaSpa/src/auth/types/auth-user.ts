export type AuthUser = {
  userAID: bigint;
  userID: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
};
