// src/domain/entities/product.spec.ts
import { Product } from './product';

describe('Product Entity', () => {
  it('deve criar um produto válido com valores iniciais', () => {
    const product = Product.create({
      tenantId: 'adega-123',
      name: 'Heineken 600ml',
      price: 1500, // R$ 15,00 em centavos
    });

    expect(product.id).toBeDefined();
    expect(product.tenantId).toBe('adega-123');
    expect(product.name).toBe('Heineken 600ml');
    expect(product.price).toBe(1500);
    expect(product.isActive).toBe(true);
    expect(product.stock).toBe(0);
  });

  it('deve lançar erro se o preço for negativo', () => {
    expect(() => {
      Product.create({
        tenantId: 'adega-123',
        name: 'Heineken 600ml',
        price: -100,
      });
    }).toThrow('O preço do produto não pode ser negativo.');
  });

  it('deve lançar erro se o nome for vazio', () => {
    expect(() => {
      Product.create({
        tenantId: 'adega-123',
        name: '   ',
        price: 1500,
      });
    }).toThrow('O nome do produto é obrigatório.');
  });

  it('deve permitir desativar e reativar o produto', () => {
    const product = Product.create({
      tenantId: 'adega-123',
      name: 'Skol Lata',
      price: 500,
    });

    product.deactivate();
    expect(product.isActive).toBe(false);

    product.activate();
    expect(product.isActive).toBe(true);
  });
});
