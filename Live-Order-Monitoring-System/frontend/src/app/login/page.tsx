"use client";

import api from "@/lib/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

const LoginPage = () => {
  // ใช้ Router เพื่อเปลี่ยนหน้า
  const router = useRouter();

  // สร้าง state สำหรับเก็บค่าจาก Input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันสำหรับปุ่ม Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // เรียก API ไปยัง Gateway ด้วย axios
      const response = await api.post("/users/api/auth/login", {
        email,
        password,
      });

      // ถ้า Login สำเร็จ ให้เก็บ Token
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        // ปลี่ยนหน้าไปที่หน้า Dashboard
        router.push("/");
      }
    } catch (error: unknown) {
      // ถ้าเกิดข้อผิดพลาด ให้แสดงข้อความผิดพลาด
      console.error("Login failed:", error);
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-24">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Live Order Dashboard
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // อัปเดต State ทุกครั้งที่พิมพ์
              required
              className="block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="admin@example.com"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {/* แสดงข้อความ Error ถ้ามี */}
          {error && (
            <p className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Login
          </button>
        </form>
      </div>
    </main>
  );
};
export default LoginPage;
