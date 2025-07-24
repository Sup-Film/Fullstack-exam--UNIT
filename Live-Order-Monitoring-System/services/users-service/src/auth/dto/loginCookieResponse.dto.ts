export class LoginCookieResponseDto {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: Date; // ถ้าต้องการให้มี created_at ก็สามารถเพิ่มได้
  };
}
