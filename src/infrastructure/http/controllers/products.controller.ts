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
  HttpCode,
  HttpStatus,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantContext } from '../../database/tenant-context';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { DeactivateProductUseCase } from '../../../application/use-cases/deactivate-product.use-case';
import { AdjustStockUseCase } from '../../../application/use-cases/adjust-stock.use-case';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProductImageUseCase } from '../../../application/use-cases/update-product-image.use-case';
import 'multer';

export class CreateProductDto {
  name!: string;
  description?: string;
  price!: number;
  minStockThreshold?: number;
}

@UseGuards(JwtAuthGuard) // Rota protegida, só entra quem tem JWT válido!
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly deactivateProduct: DeactivateProductUseCase,
    private readonly tenantContext: TenantContext,
    private readonly adjustStock: AdjustStockUseCase,
    private readonly updateProductImage: UpdateProductImageUseCase,
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
      minStockThreshold: dto.minStockThreshold,
    });

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      minStockThreshold: product.minStockThreshold,
      isLowStock: product.isLowStock,
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
      minStockThreshold: p.minStockThreshold,
      isLowStock: p.isLowStock,
    }));
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    await this.deactivateProduct.execute(tenantId, id);
    return { message: 'Produto desativado com sucesso.' };
  }
  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  async adjustStockAction(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
  ) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    await this.adjustStock.execute({
      tenantId,
      productId: id,
      type: dto.type,
      quantity: dto.quantity,
    });

    return { message: 'Estoque atualizado com sucesso.' };
  }

  @Patch(':id/image')
  @HttpCode(HttpStatus.OK) // 👈 1. Mudamos para OK (200) para podermos devolver um JSON
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File, // 👈 2. Injetamos o ficheiro corretamente!
  ) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    if (!file) {
      throw new BadRequestException('O ficheiro de imagem é obrigatório.');
    }

    // MOCK DE STORAGE
    const mockStorageUrl = `https://supabase.storage.helioserp.com/${tenantId}/products/${Date.now()}-${file.originalname}`;

    // 👈 3. O Use Case é void, então apenas executamos sem tentar guardar numa variável
    await this.updateProductImage.execute({
      tenantId,
      productId, // 👈 4. Nome correto da variável
      imageUrl: mockStorageUrl,
    });

    return {
      productId,
      imageUrl: mockStorageUrl,
      message: 'Imagem associada com sucesso (Mock Storage).',
    };
  }
}
