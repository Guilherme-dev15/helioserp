/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/application/use-cases/stock/create-product.use-case.ts
export interface CreateProductInput {
  tenantId: string;
  name: string;
  price: number;
  stock: number;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: any) {}

  async execute(input: CreateProductInput) {
    // 1. Validação de Domínio
    if (input.price <= 0) {
      throw new Error('O preço do produto deve ser maior que zero');
    }

    if (!input.tenantId) {
      throw new Error('O produto deve pertencer a um tenant válido');
    }

    // 2. Construção do Objeto
    const product = {
      tenantId: input.tenantId,
      name: input.name,
      price: input.price,
      stock: input.stock,
      createdAt: new Date(),
    };

    // 3. Persistência (AGORA USANDO .save() COMO O TESTE ESPERA)
    await this.productRepository.save(product);

    return product;
  }
}
