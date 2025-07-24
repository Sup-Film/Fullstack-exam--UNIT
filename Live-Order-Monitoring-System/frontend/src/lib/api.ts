import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // URL ของ Gateway
  withCredentials: true, // เพื่อให้สามารถส่ง Cookie ได้
});

export default api;
