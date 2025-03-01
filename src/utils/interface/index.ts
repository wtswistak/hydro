interface User {
  id: number;
  email: string;
  refreshToken?: string;
}

export interface AuthRequest extends Request {
  user: User;
}
