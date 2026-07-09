// src/domain/repositories/product.repository.ts
import { Product } from '../entities/product';

export abstract class ProductRepository {
  abstract create(product: Product): Promise<void>;
  abstract findAll(tenantId: string): Promise<Product[]>;
  abstract findById(
    tenantId: string,
    productId: string,
  ): Promise<Product | null>;
  abstract update(product: Product): Promise<void>;
}
