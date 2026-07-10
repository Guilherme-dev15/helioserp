import { Order } from './order';
import { OrderItem } from './order-item';

describe('Order Entity', () => {
  const tenantId = 'adega-123';

  it('deve criar um pedido com sucesso e calcular o total corretamente', () => {
    const item1 = OrderItem.create({
      productId: 'prod-1',
      quantity: 2,
      unitPrice: 1500,
    }); // 2x R$15,00 = 3000
    const item2 = OrderItem.create({
      productId: 'prod-2',
      quantity: 1,
      unitPrice: 5000,
    }); // 1x R$50,00 = 5000

    const order = Order.create({
      tenantId,
      items: [item1, item2],
    });

    expect(order.id).toBeDefined();
    expect(order.tenantId).toBe(tenantId);
    expect(order.items.length).toBe(2);
    expect(order.status).toBe('PENDING');
    // Total esperado: 3000 + 5000 = 8000 centavos (R$ 80,00)
    expect(order.total).toBe(8000);
  });

  it('deve lançar erro ao tentar criar um pedido sem itens', () => {
    expect(() => {
      Order.create({
        tenantId,
        items: [],
      });
    }).toThrow('Um pedido deve conter pelo menos um item.');
  });

  it('deve lançar erro ao criar um item com quantidade zero ou negativa', () => {
    expect(() => {
      OrderItem.create({ productId: 'prod-1', quantity: 0, unitPrice: 1500 });
    }).toThrow('A quantidade deve ser maior que zero.');
  });

  it('deve lançar erro ao criar um item com preço negativo', () => {
    expect(() => {
      OrderItem.create({ productId: 'prod-1', quantity: 1, unitPrice: -500 });
    }).toThrow('O preço unitário não pode ser negativo.');
  });
});
