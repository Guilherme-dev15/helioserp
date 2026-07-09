// src/infrastructure/http/controllers/products.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantContext } from '../../database/tenant-context';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { DeactivateProductUseCase } from '../../../application/use-cases/deactivate-product.use-case';

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
    private readonly listProducts: ListProductsUseCase,
    private readonly deactivateProduct: DeactivateProductUseCase,
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

  @Get()
  async findAll() {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    const products = await this.listProducts.execute(tenantId);
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      active: p.isActive,
    }));
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    await this.deactivateProduct.execute(tenantId, id);
    return { message: 'Produto desativado com sucesso.' };
  }
}
