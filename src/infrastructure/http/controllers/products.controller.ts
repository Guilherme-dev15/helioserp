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
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantContext } from '../../database/tenant-context';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { DeactivateProductUseCase } from '../../../application/use-cases/deactivate-product.use-case';
import { AdjustStockUseCase } from '../../../application/use-cases/adjust-stock.use-case';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProductImageUseCase } from '../../../application/use-cases/update-product-image.use-case';
import 'multer';
import { CreateProductUseCase } from '../../../application/use-cases/stock/create-product.use-case';
import { TenantInterceptor } from '../tenant.interceptor';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';

// 1. DTO Alinhado exatamente com o que o nosso Use Case pede
export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;
}

@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantInterceptor)
@Controller('products')
export class ProductsController {
  constructor(
    // Removidas as duplicidades. Agora injetamos o Use Case oficial apenas uma vez
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly deactivateProduct: DeactivateProductUseCase,
    private readonly tenantContext: TenantContext,
    private readonly adjustStock: AdjustStockUseCase,
    private readonly updateProductImage: UpdateProductImageUseCase,
  ) {}

  // 2. Apenas UM método POST para criar, utilizando o seu contexto de tenant
  @Post()
  async create(@Body() dto: CreateProductDto) {
    const tenantId = this.tenantContext.getTenantId();

    if (!tenantId) {
      throw new InternalServerErrorException(
        'Contexto de Tenant perdido na requisição.',
      );
    }

    const product = await this.createProductUseCase.execute({
      tenantId,
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
    });

    // 3. O retorno exato da entidade construída no Use Case
    return {
      name: product.name,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
    };
  }

  // 👇 Os seus outros endpoints permanecem intocados!
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
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const tenantId = this.tenantContext.getTenantId();
    if (!tenantId) throw new InternalServerErrorException('Contexto perdido.');

    if (!file) {
      throw new BadRequestException('O ficheiro de imagem é obrigatório.');
    }

    const mockStorageUrl = `https://supabase.storage.helioserp.com/${tenantId}/products/${Date.now()}-${file.originalname}`;

    await this.updateProductImage.execute({
      tenantId,
      productId,
      imageUrl: mockStorageUrl,
    });

    return {
      productId,
      imageUrl: mockStorageUrl,
      message: 'Imagem associada com sucesso (Mock Storage).',
    };
  }
}
