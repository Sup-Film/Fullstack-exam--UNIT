import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    // Inject 'Order' Repository:
    //    เครื่องมือสำหรับจัดการข้อมูลในตาราง 'orders' โดยเฉพาะ
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,

    // Inject 'ProductsService':
    //    เพื่อเรียกใช้งานฟังก์ชันต่างๆ จาก ProductsService เช่น การค้นหาสินค้า
    private productsService: ProductsService,

    // Inject 'DataSource':
    //    เครื่องมือหลักในการเชื่อมต่อกับ Database ใช้สำหรับทำ Transaction
    private dataSource: DataSource,

    // Inject 'RedisService'
    private redisService: RedisService,
  ) {}

  /**
   * สร้างออเดอร์ใหม่
   * @param customerId - ID ของลูกค้าที่สั่งซื้อ (จะได้รับมาจาก JWT)
   * @param createOrderDto - ข้อมูลรายการสินค้าที่สั่ง
   * @returns Order ที่สร้างเสร็จสมบูรณ์
   */
  async create(customerId: number, createOrderDto: CreateOrderDto) {
    // ดึง ID ของสินค้าทั้งหมดจาก DTO ที่รับมาจาก client
    const productIds = createOrderDto.items.map((item) => item.productId);

    // เรียกใช้ ProductsService เพื่อดึงข้อมูลสินค้าจากฐานข้อมูล โดยนำ ID ที่ได้รับมาจาก DTO หรือ client มาใช้ในการค้นหา products ที่อยู่ในฐานข้อมูล
    const products = await this.productsService.findByIds(productIds);

    // ตรวจสอบว่าสินค้าในฐ้านข้อมูล และ สินค้าที่ส่งมาจาก client ตรงกันหรือไม่
    // ถ้าจำนวนสินค้าที่ดึงมาไม่เท่ากับจำนวนที่ส่งมา แสดงว่ามีสินค้าบางรายการที่ไม่พบในฐานข้อมูล
    if (products.length !== productIds.length) {
      throw new NotFoundException('ไม่พบสินค้าบางรายการในระบบ');
    }

    // productMap จะนำข้อมูลสินค้าที่ดึงมาจากฐานข้อมูลมาเก็บในรูปแบบ Map เพื่อให้สามารถเข้าถึงข้อมูลสินค้าได้อย่างรวดเร็ว (key: productId, value: product object)
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    /* 
      Database Transaction 
      การใช้ transaction เพื่อรับประกันว่าถ้ามีขั้นตอนไหนผิดพลาด ทุกอย่างจะถูกย้อนกลับ (rollback)
      เช่น ถ้าลดสต็อกสำเร็จ แต่สร้างออเดอร์ไม่สำเร็จ สต็อกสินค้าจะกลับไปเป็นเหมือนเดิม
    */
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      let totalAmount = 0;
      const orderItemsData: {
        productId: number;
        quantity: number;
        price: number;
      }[] = [];

      // วนลูปผ่านรายการสินค้าที่สั่งซื้อ
      // itemDto หรือ OrderItemDto คือข้อมูลที่ส่งมาจาก client
      // product คือข้อมูลสินค้าที่ดึงมาจากฐานข้อมูล
      for (const itemDto of createOrderDto.items) {
        // ตรวจสอบว่ามีสินค้าตาม ID หรือไม่
        // .get จะคืนค่า undefined ถ้าไม่พบ
        const product = productMap.get(itemDto.productId);

        if (!product) {
          throw new NotFoundException(
            `ไม่พบสินค้า ID ${itemDto.productId} ในระบบ`,
          );
        }

        // เช็คสต็อกสินค้า
        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `สินค้า "${product.name}" มีในสต็อกไม่เพียงพอ`,
          );
        }

        // ลดสต็อกสินค้า (สำคัญ: ต้องทำผ่าน transactionalEntityManager)
        // ลดสต็อกสินค้าโดยนำข้อมูลที่ได้จากฐานข้อมูลมาลบกับ ข้อมูลที่ส่งมาจาก client
        const newStock = product.stock - itemDto.quantity;
        // อัพเดตสต็อกสินค้าในฐานข้อมูลโดยใช้ transactionalEntityManager และบอกว่าต้องการอัพเดต Product ที่มี ID ตรงกับ product.id โดยอัพเดตค่า stock เป็น newStock (คือค่าที่ลดลงแล้ว)
        await transactionalEntityManager.update(Product, product.id, {
          stock: newStock,
        });

        // คำนวนราคารวม
        const itemPrice = product.price * itemDto.quantity;
        totalAmount += itemPrice;

        // เตรียมข้อมูลสำหรับสร้าง OrderItem
        orderItemsData.push({
          productId: product.id,
          quantity: itemDto.quantity,
          price: product.price, // บันทึกราคา ณ วันที่สั่งซื้อ
        });
      }

      // สร้าง Instance ของ Order
      const newOrder = transactionalEntityManager.create(Order, {
        customerId,
        totalAmount,
        status: OrderStatus.PENDING,
        orderItems: orderItemsData, // TypeORM จะสร้าง OrderItem ให้เองเพราะเราตั้งค่า cascade ไว้ใน Entity
      });

      // บันทึก Order ลงฐานข้อมูล
      const savedOrder = await transactionalEntityManager.save(newOrder);
      this.logger.log(`✅ Order #${savedOrder.id} created successfully.`);

      // ส่ง Event ไปยัง Redis โดยส่งข้อมูลออเดอร์ที่ถูกสร้างขึ้นใหม่ไป
      await this.redisService.publishOrderCreated(savedOrder);

      return savedOrder;
    });
  }

  /**
   * ค้นหาออเดอร์ทั้งหมด (สำหรับ Admin/Staff)
   * @returns รายการออเดอร์ทั้งหมดพร้อมข้อมูลสินค้า
   */
  async findAll() {
    // ใช้ TypeORM เพื่อดึงข้อมูลออเดอร์ทั้งหมด พร้อมข้อมูลสินค้า
    return this.ordersRepository.find({
      /*
        'relations': บอก TypeORM ให้ดึงข้อมูลจากตารางอื่นที่เชื่อมกันอยู่มาด้วย
        ในที่นี้คือ ดึง 'orderItems' และในแต่ละ 'orderItems' ให้ดึง 'product' มาด้วย 
      */
      relations: {
        orderItems: {
          product: true, // ดึงข้อมูลสินค้าในแต่ละ OrderItem
        },
      },
      order: {
        createdAt: 'DESC', // เรียงลำดับตามวันที่สร้างใหม่ล่าสุด
      },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        orderItems: {
          product: true, // ดึงข้อมูลสินค้าในแต่ละ OrderItem
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบออเดอร์รหัส ${id}`);
    }

    return order;
  }

  /**
   * อัปเดตสถานะของออเดอร์ (สำหรับ Admin)
   * @param orderId - ID ของออเดอร์ที่ต้องการอัปเดต
   * @param status - สถานะใหม่ที่ต้องการเปลี่ยน
   * @returns ออเดอร์ที่อัปเดตแล้ว
   */
  async updateStatus(orderId: number, status: OrderStatus) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบออเดอร์รหัส ${orderId}`);
    }

    if (
      order.status === OrderStatus.CONFIRMED ||
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        `ไม่สามารถเปลี่ยนสถานะออเดอร์ที่มีสถานะ ${order.status} ได้`,
      );
    }

    order.status = status;
    const updatedOrder = await this.ordersRepository.save(order);

    // ส่ง Event ไปยัง Redis เมื่อสถานะออเดอร์ถูกเปลี่ยน
    await this.redisService.publishOrderStatusChanged(updatedOrder);

    return updatedOrder;
  }

  /**
   * ลบออเดอร์ (สำหรับ Admin)
   * @param id - ID ของออเดอร์ที่ต้องการลบ
   */
  async remove(id: number): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบออเดอร์รหัส ${id}`);
    }

    await this.ordersRepository.remove(order);
    this.logger.log(`✅ Order #${id} deleted successfully.`);
  }
}
