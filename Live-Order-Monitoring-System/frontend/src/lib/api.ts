import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/",
});

// ตั่งค่าให้ส่ง JWT ไปกับทุก Request โดยอัตโนมัติ
api.interceptors.request.use((config) => {
  // เช็คว่าอยู่ในสภาพแวดล้อมของเบราว์เซอร์หรือไม่
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
