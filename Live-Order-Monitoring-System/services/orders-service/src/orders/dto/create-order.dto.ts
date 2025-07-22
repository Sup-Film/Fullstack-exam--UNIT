import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive, ValidateNested } from 'class-validator';

// DTO ย่อยสำหรับแต่ละ item ในออเดอร์
class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @IsPositive() // จำนวนต้องเป็นเลขบวก
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true }) // ตรวจสอบทุก item ใน array
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
