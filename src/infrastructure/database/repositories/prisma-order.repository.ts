/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { Order } from '../../../domain/entities/order';
import { OrderItem } from '../../../domain/entities/order-item';
// 👇 Importamos os tipos gerados pelo próprio Prisma
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';

// 👇 Criamos um tipo exato combinando o Pedido e os Itens
type OrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryMode: order.deliveryMode,
        status: order.status,
        totalAmount: order.total,
        createdAt: order.createdAt,
        items: {
          create: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  }

  async findById(tenantId: string, orderId: string): Promise<Order | null> {
    const model = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { items: true },
    });

    if (!model) return null;

    return this.mapToDomain(model);
  }

  async findAll(tenantId: string): Promise<Order[]> {
    const models = await this.prisma.order.findMany({
      where: { tenantId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return models.map((model) => this.mapToDomain(model));
  }

  // 👇 Substituímos o 'any' pelo tipo estrito OrderWithItems
  private mapToDomain(model: OrderWithItems): Order {
    const items = model.items.map((item) =>
      OrderItem.create({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    );

    return Order.restore({
      id: model.id,
      tenantId: model.tenantId,
      customerName: model.customerName,
      customerPhone: model.customerPhone,
      deliveryMode: model.deliveryMode,
      status: model.status as 'PENDING' | 'PAID' | 'CANCELED',
      createdAt: model.createdAt,
      items,
    });
  }
}
