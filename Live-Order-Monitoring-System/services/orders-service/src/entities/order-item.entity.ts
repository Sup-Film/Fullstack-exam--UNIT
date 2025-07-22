// src/entities/order-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  // OrderItem 1 ออเดอร์ไอเทมสามารถอยู่ใน Order ได้เพียงหนึ่งรายการ
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // OrderItem 1 ออเดอร์ไอเทมสามารถมี Product ได้เพียงหนึ่งรายการ
  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  // กำหนดคอลัมน์สำหรับราคาต่อหน่วยของสินค้า
  // จะเก็บในรูปแบบทศนิยมเพื่อความแม่นยำในการคำนวณ
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;
}
