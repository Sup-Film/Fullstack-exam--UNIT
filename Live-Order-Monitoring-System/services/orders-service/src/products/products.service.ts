import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Product } from 'src/entities/product.entity';
import { In, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // CreateProduct
  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProduct) {
      throw new ConflictException(
        `สินค้าชื่อ "${createProductDto.name}" มีอยู่แล้ว`,
      );
    }

    const newProduct = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(newProduct);
  }

  // GetAllProducts
  findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { createdAt: 'DESC' } });
  }

  // GetById
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`ไม่พบสินค้ารหัส ${id}`);
    }
    return product;
  }

  // FindByIds
  async findByIds(ids: number[]): Promise<Product[]> {
    const products = await this.productsRepository.findBy({
      id: In(ids),
    });
    if (products.length === 0) {
      throw new NotFoundException(`ไม่พบสินค้ารหัส ${ids.join(', ')}`);
    }
    return products;
  }

  // UpdateProduct
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`ไม่พบสินค้ารหัส ${id}`);
    }
    this.productsRepository.merge(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  // DeleteProduct
  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่พบสินค้ารหัส ${id}`);
    }
  }
}
