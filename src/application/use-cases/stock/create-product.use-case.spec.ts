/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CreateProductUseCase } from './create-product.use-case';

describe('CreateProductUseCase', () => {
  let createProductUseCase: CreateProductUseCase;
  let mockProductRepository: any;

  beforeEach(() => {
    mockProductRepository = {
      save: jest.fn(),
      findByBarcode: jest.fn().mockResolvedValue(null),
    };
    createProductUseCase = new CreateProductUseCase(mockProductRepository);
  });

  it('deve criar um produto com sucesso e vincular ao tenant_id', async () => {
    const input = {
      tenantId: 'adega-central-001',
      name: 'Vinho Tinto Reserva',
      price: 55.0,
      stock: 10,
    };

    const output = await createProductUseCase.execute(input);

    expect(output).toBeDefined();
    expect(output.tenantId).toBe('adega-central-001');
    expect(output.name).toBe('Vinho Tinto Reserva');
    expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro se o preço for menor ou igual a zero', async () => {
    const input = {
      tenantId: 'adega-central-001',
      name: 'Produto Invalido',
      price: 0,
      stock: 5,
    };

    await expect(createProductUseCase.execute(input)).rejects.toThrow(
      'O preço do produto deve ser maior que zero',
    );
  });
});
