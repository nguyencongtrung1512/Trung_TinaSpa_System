/** sub = userID (Business ID). API không trả userAID. */
export type JwtAccessPayload = {
  sub: string;
  phone: string;
  roles: string[];
};

export type JwtRefreshPayload = {
  sub: string;
  jti: string;
};
