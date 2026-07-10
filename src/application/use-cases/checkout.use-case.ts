import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Order } from '../../domain/entities/order';
import { OrderItem } from '../../domain/entities/order-item';

export interface CheckoutCommand {
  tenantId: string;
  customerName?: string;
  customerPhone?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

@Injectable()
export class CheckoutUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: CheckoutCommand): Promise<Order> {
    if (!command.items || command.items.length === 0) {
      throw new BadRequestException('O carrinho não pode estar vazio.');
    }

    const orderItems: OrderItem[] = [];
    const productsToUpdate = [];

    // 1. Validar os produtos e o stock
    for (const item of command.items) {
      const product = await this.productRepository.findById(
        command.tenantId,
        item.productId,
      );

      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${item.productId} não encontrado.`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `O produto ${product.name} não está disponível para venda.`,
        );
      }

      // Regra de Segurança: O preço vem do banco, não do frontend!
      orderItems.push(
        OrderItem.create({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        }),
      );

      // Remove do stock usando o método seguro da nossa Entidade (que já criámos na Milestone 2)
      // Se o stock for insuficiente, a Entidade Product vai atirar um erro e cancelar a venda automaticamente.
      product.removeStock(item.quantity);
      productsToUpdate.push(product);
    }

    // 2. Criar a Entidade de Pedido
    const order = Order.create({
      tenantId: command.tenantId,
      customerName: command.customerName,
      customerPhone: command.customerPhone,
      items: orderItems,
    });

    // 3. Persistência (Orquestração de Repositórios)
    // Primeiro atualizamos o stock dos produtos no banco
    for (const product of productsToUpdate) {
      await this.productRepository.update(product);
    }

    // Por fim, gravamos o pedido e os itens no banco
    await this.orderRepository.create(order);

    return order;
  }
}
