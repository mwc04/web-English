export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  level: string;
  token?: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}