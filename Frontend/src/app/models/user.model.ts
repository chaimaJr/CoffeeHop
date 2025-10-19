export interface User {
  id: number;
  username: string;
  email: string;
  role: 'CUSTOMER' | 'BARISTA' | 'ADMIN';
  loyalty_points: number;
  phone?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
