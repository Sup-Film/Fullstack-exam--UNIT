import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/* 
  เป็นการกำหนดว่า UpdateProductDto จะมีคุณสมบัติทั้งหมดของ CreateProductDto แต่เป็นแบบ optional
  ซึ่งหมายความว่า ในการอัปเดตข้อมูลสินค้า ผู้ใช้ไม่จำเป็นต้องส่งค่าทั้งหมดของสินค้า
  แต่สามารถส่งค่าที่ต้องการอัปเดตได้เท่านั้น
*/

export class UpdateProductDto extends PartialType(CreateProductDto) {}
