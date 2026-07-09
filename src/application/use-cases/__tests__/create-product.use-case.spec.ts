/* eslint-disable @typescript-eslint/unbound-method */
// src/application/use-cases/__tests__/create-product.use-case.spec.ts
import { CreateProductUseCase } from '../create-product.use-case';
import { ProductRepository } from '../../../domain/repositories/product.repository';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    // Criamos um Dublê (Mock) do repositório para não precisarmos de banco de dados no teste unitário
    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new CreateProductUseCase(mockRepository);
  });

  it('deve criar e persistir um produto com sucesso', async () => {
    const command = {
      tenantId: 'adega-777',
      name: 'Jack Daniels 1L',
      description: 'Whisky Tennessee',
      price: 15000, // R$ 150,00
    };

    const product = await useCase.execute(command);

    // Verifica se a entidade foi criada corretamente
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Jack Daniels 1L');
    expect(product.price).toBe(15000);

    // Verifica se o maestro chamou o repositório mandando a entidade certa
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(mockRepository.create).toHaveBeenCalledWith(product);
  });

  it('deve repassar o erro se a entidade Produto for inválida', async () => {
    const invalidCommand = {
      tenantId: 'adega-777',
      name: '', // Nome inválido!
      price: 15000,
    };

    await expect(useCase.execute(invalidCommand)).rejects.toThrow(
      'O nome do produto é obrigatório.',
    );
    // O repositório NÃO deve ser chamado se a entidade falhar
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
