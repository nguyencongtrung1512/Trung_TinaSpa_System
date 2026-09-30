/** sub = userID (Business ID), không dùng userAID để tránh lộ khóa kỹ thuật tăng tuần tự. */
export type JwtAccessPayload = {
  sub: string;
  phone: string;
  roles: string[];
};

export type JwtRefreshPayload = {
  sub: string;
  jti: string;
};
