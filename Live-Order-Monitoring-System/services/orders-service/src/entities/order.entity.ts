import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

// กำหนดสถานะของคำสั่งซื้อ
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // กำหนดคอลัมน์สำหรับรหัสลูกค้า
  @Index()
  @Column({ name: 'customer_id' })
  customerId: number;

  // กำหนดคอลัมน์สำหรับยอดรวมของคำสั่งซื้อ
  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  // กำหนดคอลัมน์สำหรับสถานะของคำสั่งซื้อ
  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  // กำหนดคอลัมน์สำหรับวันที่และเวลาที่คำสั่งซื้อถูกสร้าง
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // กำหนดคอลัมน์สำหรับวันที่และเวลาที่คำสั่งซื้อถูกปรับปรุงล่าสุด
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // กำหนดความสัมพันธ์แบบ OneToMany กับ OrderItem
  // Order 1 ออเดอร์ สามารถมี OrderItem หลายรายการ
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['insert', 'update'],
  })
  orderItems: OrderItem[];
}
