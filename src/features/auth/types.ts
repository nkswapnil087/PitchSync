export type RoleId =
  | "super-admin"
  | "board-admin"
  | "performance-manager"
  | "match-official"
  | "integrity-officer"
  | "player";

export type AuthSession = {
  accountId: string;
  personId: string;
  username: string;
  fullName: string;
  role: RoleId;
};
