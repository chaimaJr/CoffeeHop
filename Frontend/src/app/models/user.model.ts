export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  loyalty_points: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}