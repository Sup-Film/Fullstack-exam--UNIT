"use client";

import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// กำหนดข้อมูล OrderItem
interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
  };
}

// กำหนดข้อมูล Order ที่มี OrderItem interface อยู่ภายในเป็น Array
interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function Home() {
  const queryClient = useQueryClient();
  const socket = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3000"
  );

  // ดึงข้อมูลเริ่มต้นด้วย React Query
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<Order[]>({
    queryKey: ["orders"], // ตั้งชื่อ Key สำหรับ Cache ของข้อมูลนี้
    queryFn: async () => {
      // ฟังก์ชันสำหรับดึงข้อมูล
      const { data } = await api.get("/orders/api/orders");
      console.log("Fetched orders:", data);
      return data;
    },
    refetchOnWindowFocus: false, // ปิดการ refetch อัตโนมัติเมื่อกลับมาที่หน้าต่าง
  });

  // จัดการ Real-time Events ด้วย useEffect
  useEffect(() => {
    if (!socket) return;

    // ฟังก์ชันสำหรับดักฟัง Event ใหม่ๆ ที่มาจาก Socket
    const handleNewOrder = (newOrder: Order) => {
      console.log("New order received:", newOrder);

      // อัพเดต Cache ของ React Query ด้วยข้อมูลใหม่
      queryClient.setQueryData<Order[]>(["orders"], (oldData = []) => {
        // ตรวจสอบว่ามี Order นี้อยู่ใน Cache หรือไม่
        const existingOrder = oldData.find((order) => order.id === newOrder.id);
        if (existingOrder) {
          // ถ้ามีอยู่แล้ว ให้ไม่ทำอะไร
          return oldData;
        }
        // ถ้าไม่มี ให้เพิ่ม Order ใหม่เข้าไป
        return [...oldData, newOrder];
      });
    };

    // ฟังก์ชันสำหรับดักฟัง Event 'order_status_update'
    const handleStatusUpdate = (update: { id: number; status: string }) => {
      console.log("🔄 Order Status Updated:", update);
      queryClient.setQueryData<Order[]>(["orders"], (oldData = []) => {
        // ค้นหาและอัปเดตเฉพาะออเดอร์ที่มีการเปลี่ยนแปลง
        return oldData.map((order) =>
          order.id === update.id ? { ...order, status: update.status } : order
        );
      });
    };

    // เริ่มดักฟัง
    socket.on("new_order", handleNewOrder);
    socket.on("order_status_update", handleStatusUpdate);

    // Cleanup function: หยุดดักฟังเมื่อ Component ถูกทำลาย
    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_update", handleStatusUpdate);
    };
  }, [socket, queryClient]); // useEffect จะทำงานใหม่เมื่อ socket หรือ queryClient เปลี่ยนไป

  const { mutate: updateOrderStatus, isPending } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => {
      // ยิง API PATCH ไปที่ Gateway
      return api.patch(`/orders/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      // เราไม่จำเป็นต้องทำอะไรที่นี่ เพราะเมื่อ API สำเร็จ
      // Backend จะส่ง Event ผ่าน WebSocket มาอัปเดตหน้าจอให้เราเอง
      console.log("Update successful, waiting for WebSocket event...");
    },
    onError: (err) => {
      console.error("Failed to update status:", err);
      alert("Failed to update order status!");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading orders. Please try again.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Live Order Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <span
              className={`h-3 w-3 rounded-full ${
                socket?.connected ? "bg-green-500" : "bg-red-500"
              }`}></span>
            <span>{socket?.connected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.orderItems
                      .map((item) => `${item.quantity}x ${item.product.name}`)
                      .join(", ")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {order.status === "pending" && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            updateOrderStatus({
                              orderId: order.id,
                              status: "confirmed",
                            })
                          }
                          disabled={isPending}
                          className="rounded-md bg-blue-600 px-3 py-1 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                          Confirm
                        </button>
                        <button
                          onClick={() =>
                            updateOrderStatus({
                              orderId: order.id,
                              status: "cancelled",
                            })
                          }
                          disabled={isPending}
                          className="rounded-md bg-red-600 px-3 py-1 text-white shadow-sm hover:bg-red-700 disabled:opacity-50">
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
