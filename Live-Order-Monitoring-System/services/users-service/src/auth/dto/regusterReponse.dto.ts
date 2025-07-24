export interface RegisterResponseDto {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: Date;
  };
}
