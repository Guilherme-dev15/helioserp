// src/domain/repositories/product.repository.ts
import { Product } from '../entities/product';

export abstract class ProductRepository {
  abstract create(product: Product): Promise<void>;
  // Adicionaremos findById, update e etc. conforme a demanda
}
