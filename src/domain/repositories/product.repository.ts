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

  // NOSSOS DOIS NOVOS MÉTODOS ATÔMICOS:
  abstract incrementStock(
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
  abstract decrementStock(
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
}
