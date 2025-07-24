"use client";

import api from "@/lib/api";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

const RegisterPage = () => {
  // ใช้ Router เพื่อเปลี่ยนหน้า
  const router = useRouter();

  // สร้าง state สำหรับเก็บค่าจาก Input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันสำหรับปุ่ม Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // เรียก API ไปยัง Gateway ด้วย axios
      const response = await api.post("/users/api/auth/register", {
        email,
        password,
        name,
      });

      // ถ้าสำเร็จจะได้รับ status 201 Created
      if (response.status === 201) {
        router.push("/login");
      }
    } catch (error: unknown) {
      // ถ้าเกิดข้อผิดพลาด ให้แสดงข้อความผิดพลาด
      console.error("Registration failed:", error);
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message || "An unexpected error occurred."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">สมัครสมาชิก</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            สมัครสมาชิก
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
