export type AuthUser = {
  userAID: string;
  userID: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  branchAID: string | null;
  branchID: string | null;
};
