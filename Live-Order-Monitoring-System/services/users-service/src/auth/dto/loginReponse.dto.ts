export interface LoginResponseDto {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: Date;
  };
}
