/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// gateway/src/events/events.gateway.ts
import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// @WebSocketGateway() จะใช้ port เดียวกับ HTTP server (3000)
// เราเพิ่ม cors เข้าไปเพื่อให้ Frontend จาก URL อื่นเชื่อมต่อได้
@WebSocketGateway({
  cors: {
    origin: '*', // ใน Production ควรระบุ URL ของ Frontend ให้ชัดเจน
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  // @WebSocketServer() จะ inject instance ของ Socket.IO server เข้ามาให้เรา
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('✅ WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`🤝 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`👋 Client disconnected: ${client.id}`);
  }

  /**
   * Method สำหรับกระจายข้อมูลออเดอร์ใหม่ไปยัง Client ทุกคน
   * @param order - ข้อมูลออเดอร์ที่ได้รับมาจาก Redis
   */
  broadcastNewOrder(order: any) {
    // 'new_order' คือชื่อ event ที่ Frontend จะดักฟัง
    this.server.emit('new_order', order);
    this.logger.log(`📢 Broadcasting new order #${order.id} to all clients`);
  }

  /**
   * Method สำหรับกระจายข้อมูลการอัปเดตสถานะ
   */
  broadcastOrderStatusUpdate(update: any) {
    // 'order_status_update' คือชื่อ event ที่ Frontend จะดักฟัง
    this.server.emit('order_status_update', update);
    this.logger.log(
      `📢 Broadcasting status update for order #${update.id} to ${update.status}`,
    );
  }
}
