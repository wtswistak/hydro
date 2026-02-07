export interface TokenPayload {
  sub: number;
  email: string;
}

export interface CreateToken {
  userId: number;
  token: string;
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
}
