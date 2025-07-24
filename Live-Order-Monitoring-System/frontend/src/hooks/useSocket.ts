"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // เชื่อมต่อกับ WebSocket Server
    const newSocket = io(url, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("👋 Disconnected from WebSocket");
    });

    // ตั้งค่าให้ socket state เป็น socket ใหม่ที่เชื่อมต่อ
    setSocket(newSocket);

    // ปิดการเชื่อมต่อเมื่อคอมโพเนนต์ถูก unmount
    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  return socket;
};
