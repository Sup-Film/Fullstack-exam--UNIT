import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/",
  withCredentials: true, // เพื่อให้สามารถส่ง Cookie ได้
});

export default api;
