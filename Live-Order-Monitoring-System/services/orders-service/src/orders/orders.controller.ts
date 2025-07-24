import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserFromHeaderGuard } from 'src/auth/guards/user-from-header.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Endpoint สำหรับลูกค้า (Customer) เพื่อสร้างออเดอร์ใหม่
   * POST /api/orders
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    const customerId = 1;
    return this.ordersService.create(customerId, createOrderDto);
  }

  /**
   * Endpoint สำหรับพนักงาน (Staff/Admin) เพื่อดูออเดอร์ทั้งหมด
   * GET /api/orders
   */
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * Endpoint สำหรับพนักงาน (Staff/Admin) เพื่อดูรายละเอียดออเดอร์เดียว
   * GET /api/orders/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe จะทำให้ id เป็น number ทันที
    return this.ordersService.findOne(id);
  }
  /**
   * Endpoint สำหรับแอดมิน (Admin) เพื่ออัปเดตสถานะออเดอร์
   * PATCH /api/orders/:id/status
   */
  @Patch(':id/status')
  @Roles('admin', 'staff') // กำหนดให้เฉพาะแอดมินเท่านั้นที่สามารถเข้าถึงได้
  @UseGuards(UserFromHeaderGuard, RolesGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderDto.status);
  }

  /**
   * Endpoint สำหรับแอดมิน (Admin) เพื่อลบออเดอร์
   * DELETE /api/orders/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // .remove() จะไม่คืนค่าอะไรกลับมา เราจึง return โดยตรง
    return this.ordersService.remove(id);
  }
}
