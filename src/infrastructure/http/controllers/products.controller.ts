// src/infrastructure/http/controllers/products.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantContext } from '../../database/tenant-context';

export class CreateProductDto {
  name!: string;
  description?: string;
  price!: number;
}

@UseGuards(JwtAuthGuard) // Rota protegida, só entra quem tem JWT válido!
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly tenantContext: TenantContext,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    // Pega o ID da loja injetado silenciosamente pelo nosso Interceptor
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new InternalServerErrorException(
        'Contexto de Tenant perdido na requisição.',
      );
    }

    const product = await this.createProduct.execute({
      tenantId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
    });

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    };
  }
}
